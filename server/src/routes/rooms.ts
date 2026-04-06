import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authGuard, type AuthPayload } from "../middleware/auth.js";
import { createRoomWithDefaultChannels, listRoomsWithChannels } from "../db/queries.js";

const createRoomSchema = z.object({
  name: z.string().trim().min(2).max(48)
});

const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [authGuard] }, async () => {
    return {
      rooms: listRoomsWithChannels()
    };
  });

  app.post("/", { preHandler: [authGuard] }, async (request, reply) => {
    const payload = request.user as AuthPayload;
    const parsed = createRoomSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid payload",
        details: parsed.error.flatten()
      });
    }

    try {
      const created = createRoomWithDefaultChannels({
        name: parsed.data.name,
        createdBy: payload.userId
      });
      return reply.code(201).send({
        room: {
          id: created.room.id,
          name: created.room.name,
          createdBy: created.room.created_by,
          createdAt: created.room.created_at,
          channels: created.channels.map((channel) => ({
            id: channel.id,
            roomId: channel.room_id,
            type: channel.type,
            name: channel.name,
            createdAt: channel.created_at
          }))
        }
      });
    } catch {
      return reply.code(409).send({ error: "Room with this name already exists" });
    }
  });
};

export default roomsRoutes;

