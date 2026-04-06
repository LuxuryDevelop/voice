import { createHash, randomBytes } from "node:crypto";
import { FastifyInstance } from "fastify";
import { config } from "../config.js";
import {
  createRefreshToken,
  revokeRefreshTokenByHash,
  getActiveRefreshTokenByHash,
  type UserRecord
} from "../db/queries.js";

const durationToMs = (value: string): number => {
  const match = /^(\d+)(ms|s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }
  const count = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000
  };
  return count * multipliers[unit];
};

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

export const issueSessionTokens = (app: FastifyInstance, user: UserRecord): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = app.jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    { expiresIn: config.JWT_ACCESS_TTL }
  );

  const refreshToken = randomBytes(48).toString("hex");
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = Date.now() + durationToMs(config.JWT_REFRESH_TTL);
  createRefreshToken({ userId: user.id, tokenHash: refreshTokenHash, expiresAt });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = (rawRefreshToken: string): { userId: string } | null => {
  const tokenHash = sha256(rawRefreshToken);
  const tokenRecord = getActiveRefreshTokenByHash(tokenHash);
  if (!tokenRecord) {
    return null;
  }
  if (tokenRecord.expires_at < Date.now()) {
    revokeRefreshTokenByHash(tokenHash);
    return null;
  }
  revokeRefreshTokenByHash(tokenHash);
  return { userId: tokenRecord.user_id };
};

