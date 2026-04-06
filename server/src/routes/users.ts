import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authGuard, type AuthPayload, requireAdmin } from "../middleware/auth.js";
import {
  createInvite,
  findUserById,
  listInvites,
  listUsers,
  setUserBanState,
  revokeAllRefreshTokensByUserId
} from "../db/queries.js";

const banSchema = z.object({
  reason: z.string().trim().min(3).max(300).optional()
});

const inviteSchema = z.object({
  code: z.string().trim().min(4).max(64).optional(),
  maxUses: z.coerce.number().int().min(1).max(10_000).default(1),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional()
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", { preHandler: [authGuard] }, async (request, reply) => {
    const payload = request.user as AuthPayload;
    const user = findUserById(payload.userId);
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      status: user.status,
      role: user.role,
      isBanned: Boolean(user.is_banned),
      bannedReason: user.banned_reason
    };
  });

  app.get("/", { preHandler: [authGuard, requireAdmin] }, async () => {
    return {
      users: listUsers().map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        isBanned: Boolean(user.is_banned),
        bannedReason: user.banned_reason,
        createdAt: user.created_at
      }))
    };
  });

  app.post("/:userId/ban", { preHandler: [authGuard, requireAdmin] }, async (request, reply) => {
    const payload = request.user as AuthPayload;
    if (payload.userId === (request.params as { userId: string }).userId) {
      return reply.code(400).send({ error: "Admin cannot ban themselves" });
    }

    const bodyParsed = banSchema.safeParse(request.body ?? {});
    if (!bodyParsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: bodyParsed.error.flatten() });
    }

    const params = request.params as { userId: string };
    const targetUser = findUserById(params.userId);
    if (!targetUser) {
      return reply.code(404).send({ error: "User not found" });
    }

    setUserBanState({
      userId: params.userId,
      banned: true,
      reason: bodyParsed.data.reason
    });
    revokeAllRefreshTokensByUserId(params.userId);

    return { ok: true };
  });

  app.post("/:userId/unban", { preHandler: [authGuard, requireAdmin] }, async (request, reply) => {
    const params = request.params as { userId: string };
    const targetUser = findUserById(params.userId);
    if (!targetUser) {
      return reply.code(404).send({ error: "User not found" });
    }
    setUserBanState({
      userId: params.userId,
      banned: false
    });
    return { ok: true };
  });

  app.get("/invites", { preHandler: [authGuard, requireAdmin] }, async () => ({
    invites: listInvites()
  }));

  app.post("/invites", { preHandler: [authGuard, requireAdmin] }, async (request, reply) => {
    const payload = request.user as AuthPayload;
    const parsed = inviteSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const expiresAt = parsed.data.expiresInDays
      ? Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000
      : null;

    const invite = createInvite({
      code: parsed.data.code,
      maxUses: parsed.data.maxUses,
      expiresAt,
      createdBy: payload.userId
    });

    return reply.code(201).send(invite);
  });
};

export default usersRoutes;

