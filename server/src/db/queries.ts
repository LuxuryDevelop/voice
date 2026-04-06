import { randomUUID } from "node:crypto";
import { getDb } from "./schema.js";

export type UserRole = "admin" | "user";

export type UserRecord = {
  id: string;
  username: string;
  password_hash: string;
  avatar_url: string | null;
  status: string;
  role: UserRole;
  is_banned: number;
  banned_reason: string | null;
  created_at: number;
};

export type RoomRecord = {
  id: string;
  name: string;
  created_by: string;
  created_at: number;
};

export type ChannelRecord = {
  id: string;
  room_id: string;
  type: "text" | "voice";
  name: string;
  created_at: number;
};

export const countUsers = (): number => {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  return row.count;
};

export const findUserByUsername = (username: string): UserRecord | undefined => {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRecord | undefined;
};

export const findUserById = (userId: string): UserRecord | undefined => {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRecord | undefined;
};

export const listUsers = (): UserRecord[] => {
  const db = getDb();
  return db
    .prepare(
      "SELECT id, username, password_hash, avatar_url, status, role, is_banned, banned_reason, created_at FROM users ORDER BY created_at ASC"
    )
    .all() as UserRecord[];
};

export const createUser = (params: {
  username: string;
  passwordHash: string;
  avatarUrl?: string | null;
  role?: UserRole;
}): UserRecord => {
  const db = getDb();
  const now = Date.now();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO users (
      id,
      username,
      password_hash,
      avatar_url,
      status,
      role,
      is_banned,
      banned_reason,
      created_at
    )
    VALUES (
      @id,
      @username,
      @password_hash,
      @avatar_url,
      'offline',
      @role,
      0,
      NULL,
      @created_at
    )
  `).run({
    id,
    username: params.username,
    password_hash: params.passwordHash,
    avatar_url: params.avatarUrl ?? null,
    role: params.role ?? "user",
    created_at: now
  });

  return {
    id,
    username: params.username,
    password_hash: params.passwordHash,
    avatar_url: params.avatarUrl ?? null,
    status: "offline",
    role: params.role ?? "user",
    is_banned: 0,
    banned_reason: null,
    created_at: now
  };
};

export const setUserBanState = (params: { userId: string; banned: boolean; reason?: string }): void => {
  const db = getDb();
  db.prepare("UPDATE users SET is_banned = @is_banned, banned_reason = @banned_reason WHERE id = @user_id").run({
    user_id: params.userId,
    is_banned: params.banned ? 1 : 0,
    banned_reason: params.banned ? params.reason ?? "Banned by administrator" : null
  });
};

export const getInviteByCode = (code: string): {
  code: string;
  created_by: string | null;
  max_uses: number;
  uses: number;
  expires_at: number | null;
} | undefined => {
  const db = getDb();
  return db
    .prepare("SELECT code, created_by, max_uses, uses, expires_at FROM invites WHERE code = ?")
    .get(code) as
    | {
        code: string;
        created_by: string | null;
        max_uses: number;
        uses: number;
        expires_at: number | null;
      }
    | undefined;
};

export const listInvites = (): Array<{
  code: string;
  created_by: string | null;
  max_uses: number;
  uses: number;
  expires_at: number | null;
  created_at: number;
}> => {
  const db = getDb();
  return db
    .prepare("SELECT code, created_by, max_uses, uses, expires_at, created_at FROM invites ORDER BY created_at DESC")
    .all() as Array<{
    code: string;
    created_by: string | null;
    max_uses: number;
    uses: number;
    expires_at: number | null;
    created_at: number;
  }>;
};

export const createInvite = (params: {
  code?: string;
  createdBy?: string;
  maxUses?: number;
  expiresAt?: number | null;
}): { code: string } => {
  const db = getDb();
  const code = params.code ?? randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  db.prepare(`
    INSERT INTO invites (code, created_by, max_uses, uses, expires_at, created_at)
    VALUES (@code, @created_by, @max_uses, 0, @expires_at, @created_at)
  `).run({
    code,
    created_by: params.createdBy ?? "system",
    max_uses: params.maxUses ?? 1,
    expires_at: params.expiresAt ?? null,
    created_at: Date.now()
  });
  return { code };
};

export const ensureInviteExists = (code: string, createdBy?: string): void => {
  const invite = getInviteByCode(code);
  if (invite) {
    return;
  }
  createInvite({ code, maxUses: 1000, createdBy, expiresAt: null });
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
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at)
    VALUES (@id, @user_id, @token_hash, @expires_at, NULL, @created_at)
  `).run({
    id,
    user_id: params.userId,
    token_hash: params.tokenHash,
    expires_at: params.expiresAt,
    created_at: Date.now()
  });
  return id;
};

export const getActiveRefreshTokenByHash = (tokenHash: string): { user_id: string; expires_at: number } | undefined => {
  const db = getDb();
  return db
    .prepare(`
      SELECT user_id, expires_at
      FROM refresh_tokens
      WHERE token_hash = @token_hash AND revoked_at IS NULL
      LIMIT 1
    `)
    .get({ token_hash: tokenHash }) as { user_id: string; expires_at: number } | undefined;
};

export const revokeRefreshTokenByHash = (tokenHash: string): void => {
  const db = getDb();
  db.prepare("UPDATE refresh_tokens SET revoked_at = @revoked_at WHERE token_hash = @token_hash").run({
    token_hash: tokenHash,
    revoked_at: Date.now()
  });
};

export const revokeAllRefreshTokensByUserId = (userId: string): void => {
  const db = getDb();
  db.prepare("UPDATE refresh_tokens SET revoked_at = @revoked_at WHERE user_id = @user_id AND revoked_at IS NULL").run({
    user_id: userId,
    revoked_at: Date.now()
  });
};

export const purgeExpiredRefreshTokens = (): void => {
  const db = getDb();
  db.prepare("DELETE FROM refresh_tokens WHERE expires_at < @now").run({ now: Date.now() });
};

export const createRoomWithDefaultChannels = (params: {
  name: string;
  createdBy: string;
}): { room: RoomRecord; channels: ChannelRecord[] } => {
  const db = getDb();
  const roomId = randomUUID();
  const now = Date.now();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO rooms (id, name, created_by, created_at)
      VALUES (@id, @name, @created_by, @created_at)
    `).run({
      id: roomId,
      name: params.name,
      created_by: params.createdBy,
      created_at: now
    });

    db.prepare(`
      INSERT INTO channels (id, room_id, type, name, created_at)
      VALUES (@id, @room_id, @type, @name, @created_at)
    `).run({
      id: randomUUID(),
      room_id: roomId,
      type: "text",
      name: "general",
      created_at: now
    });

    db.prepare(`
      INSERT INTO channels (id, room_id, type, name, created_at)
      VALUES (@id, @room_id, @type, @name, @created_at)
    `).run({
      id: randomUUID(),
      room_id: roomId,
      type: "voice",
      name: "lounge",
      created_at: now
    });
  })();

  const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId) as RoomRecord;
  const channels = db.prepare("SELECT * FROM channels WHERE room_id = ? ORDER BY created_at ASC").all(roomId) as ChannelRecord[];
  return { room, channels };
};

export const listRoomsWithChannels = (): Array<{
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  channels: Array<{ id: string; roomId: string; type: "text" | "voice"; name: string; createdAt: number }>;
}> => {
  const db = getDb();
  const rooms = db.prepare("SELECT * FROM rooms ORDER BY created_at ASC").all() as RoomRecord[];
  const channels = db.prepare("SELECT * FROM channels ORDER BY created_at ASC").all() as ChannelRecord[];

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    createdBy: room.created_by,
    createdAt: room.created_at,
    channels: channels
      .filter((channel) => channel.room_id === room.id)
      .map((channel) => ({
        id: channel.id,
        roomId: channel.room_id,
        type: channel.type,
        name: channel.name,
        createdAt: channel.created_at
      }))
  }));
};

export const deleteRoomById = (roomId: string): boolean => {
  const db = getDb();
  const result = db.prepare("DELETE FROM rooms WHERE id = ?").run(roomId);
  return result.changes > 0;
};
