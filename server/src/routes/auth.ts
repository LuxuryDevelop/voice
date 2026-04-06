import argon2 from "argon2";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  consumeInvite,
  createUser,
  findUserById,
  findUserByUsername,
  getInviteByCode,
  purgeExpiredRefreshTokens
} from "../db/queries.js";
import { issueSessionTokens, rotateRefreshToken } from "../auth/session.js";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(24),
  password: z.string().min(8).max(128),
  inviteCode: z.string().trim().min(4).max(64)
});

const loginSchema = z.object({
  username: z.string().trim().min(3).max(24),
  password: z.string().min(8).max(128)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(16)
});

const toPublicUser = (user: {
  id: string;
  username: string;
  avatar_url: string | null;
  status: string;
  role: "admin" | "user";
}) => ({
  id: user.id,
  username: user.username,
  avatarUrl: user.avatar_url,
  status: user.status,
  role: user.role
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const username = parsed.data.username;
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return reply.code(409).send({ error: "Username already exists" });
    }

    const invite = getInviteByCode(parsed.data.inviteCode);
    if (!invite) {
      return reply.code(400).send({ error: "Invalid invite code" });
    }
    if (invite.expires_at && invite.expires_at < Date.now()) {
      return reply.code(400).send({ error: "Invite code expired" });
    }
    if (invite.uses >= invite.max_uses) {
      return reply.code(400).send({ error: "Invite code usage limit reached" });
    }

    const passwordHash = await argon2.hash(parsed.data.password);
    const user = createUser({
      username,
      passwordHash,
      role: "user"
    });
    consumeInvite(parsed.data.inviteCode);
    const tokens = issueSessionTokens(app, user);

    return reply.code(201).send({
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  });

  app.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const user = findUserByUsername(parsed.data.username);
    if (!user) {
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    if (user.is_banned) {
      return reply.code(403).send({
        error: "Account is banned",
        reason: user.banned_reason ?? "No reason provided"
      });
    }

    const validPassword = await argon2.verify(user.password_hash, parsed.data.password);
    if (!validPassword) {
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    const tokens = issueSessionTokens(app, user);
    return reply.send({
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  });

  app.post("/refresh", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    purgeExpiredRefreshTokens();
    const tokenContext = rotateRefreshToken(parsed.data.refreshToken);
    if (!tokenContext) {
      return reply.code(401).send({ error: "Invalid refresh token" });
    }

    const user = findUserById(tokenContext.userId);
    if (!user) {
      return reply.code(401).send({ error: "User not found" });
    }

    if (user.is_banned) {
      return reply.code(403).send({ error: "Account is banned" });
    }

    const tokens = issueSessionTokens(app, user);
    return reply.send({
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  });
};

export default authRoutes;

