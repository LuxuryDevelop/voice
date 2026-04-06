import { FastifyPluginAsync } from "fastify";

const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return {
      rooms: [],
      note: "Step 2 will add SQLite-backed room CRUD."
    };
  });
};

export default roomsRoutes;

