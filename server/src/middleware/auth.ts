import { FastifyReply, FastifyRequest } from "fastify";

export type AuthPayload = {
  userId: string;
  username: string;
};

export const authGuard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify<AuthPayload>();
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
};

