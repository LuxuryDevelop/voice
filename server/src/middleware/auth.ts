import { FastifyReply, FastifyRequest } from "fastify";

export type AuthPayload = {
  userId: string;
  username: string;
  role: "admin" | "user";
};

export const authGuard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify<AuthPayload>();
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
};

export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const payload = request.user as AuthPayload | undefined;
  if (payload?.role === "admin") {
    return;
  }
  reply.code(403).send({ error: "Admin privileges required" });
};
