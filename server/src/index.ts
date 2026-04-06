import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./config.js";
import { getDb, closeDb } from "./db/schema.js";
import authRoutes from "./routes/auth.js";
import roomsRoutes from "./routes/rooms.js";
import messagesRoutes from "./routes/messages.js";
import usersRoutes from "./routes/users.js";
import { registerSocketServer } from "./socket/index.js";

const start = async (): Promise<void> => {
  const app = Fastify({ logger: true });
  getDb();

  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true
  });
  await app.register(jwt, { secret: config.JWT_ACCESS_SECRET });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  app.get("/api/health", async () => ({
    status: "ok",
    service: "luxuryvoice-server",
    timestamp: Date.now()
  }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(roomsRoutes, { prefix: "/api/rooms" });
  await app.register(messagesRoutes, { prefix: "/api/messages" });
  await app.register(usersRoutes, { prefix: "/api/users" });

  const io = new SocketIOServer(app.server, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true
    },
    path: "/socket.io"
  });

  registerSocketServer(io);

  app.addHook("onClose", async () => {
    io.close();
    closeDb();
  });

  await app.listen({
    host: config.HOST,
    port: config.SERVER_PORT
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

