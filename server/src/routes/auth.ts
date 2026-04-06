import { FastifyPluginAsync } from "fastify";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (_request, reply) => {
    return reply.code(501).send({
      error: "Not implemented yet",
      step: "Step 2 (DB + auth logic)"
    });
  });

  app.post("/login", async (_request, reply) => {
    return reply.code(501).send({
      error: "Not implemented yet",
      step: "Step 2 (DB + auth logic)"
    });
  });

  app.post("/refresh", async (_request, reply) => {
    return reply.code(501).send({
      error: "Not implemented yet",
      step: "Step 2 (refresh token rotation)"
    });
  });
};

export default authRoutes;

