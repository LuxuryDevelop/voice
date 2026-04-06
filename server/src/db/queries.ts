import { randomUUID } from "node:crypto";
import { getDb } from "./schema.js";

export type UserRecord = {
  id: string;
  username: string;
  password_hash: string;
  avatar_url: string | null;
  status: string;
  created_at: number;
};

export const findUserByUsername = (username: string): UserRecord | undefined => {
  const db = getDb();
  const statement = db.prepare("SELECT * FROM users WHERE username = ?");
  return statement.get(username) as UserRecord | undefined;
};

export const createUser = (params: {
  username: string;
  passwordHash: string;
  avatarUrl?: string | null;
}): UserRecord => {
  const db = getDb();
  const now = Date.now();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO users (id, username, password_hash, avatar_url, status, created_at)
    VALUES (@id, @username, @password_hash, @avatar_url, 'offline', @created_at)
  `).run({
    id,
    username: params.username,
    password_hash: params.passwordHash,
    avatar_url: params.avatarUrl ?? null,
    created_at: now
  });

  return {
    id,
    username: params.username,
    password_hash: params.passwordHash,
    avatar_url: params.avatarUrl ?? null,
    status: "offline",
    created_at: now
  };
};

export const getInviteByCode = (code: string): {
  code: string;
  max_uses: number;
  uses: number;
  expires_at: number | null;
} | undefined => {
  const db = getDb();
  return db
    .prepare("SELECT code, max_uses, uses, expires_at FROM invites WHERE code = ?")
    .get(code) as
    | {
        code: string;
        max_uses: number;
        uses: number;
        expires_at: number | null;
      }
    | undefined;
};

export const consumeInvite = (code: string): void => {
  const db = getDb();
  db.prepare("UPDATE invites SET uses = uses + 1 WHERE code = ?").run(code);
};

export const createRefreshToken = (params: {
  userId: string;
  tokenHash: string;
  expiresAt: number;
}): string => {
  const db = getDb();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
    VALUES (@id, @user_id, @token_hash, @expires_at, @created_at)
  `).run({
    id,
    user_id: params.userId,
    token_hash: params.tokenHash,
    expires_at: params.expiresAt,
    created_at: Date.now()
  });
  return id;
};

