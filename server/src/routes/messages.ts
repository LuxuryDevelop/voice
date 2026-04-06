import { FastifyPluginAsync } from "fastify";

const messagesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/:channelId", async (request) => {
    const params = request.params as { channelId: string };
    return {
      channelId: params.channelId,
      messages: [],
      note: "Step 3/7 will add real-time and persisted messages."
    };
  });
};

export default messagesRoutes;

