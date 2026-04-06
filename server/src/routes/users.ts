import { FastifyPluginAsync } from "fastify";

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (_request, reply) => {
    return reply.code(501).send({
      error: "Not implemented yet",
      step: "Step 2/3 (auth + presence profile)"
    });
  });
};

export default usersRoutes;

