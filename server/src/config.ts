import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  SERVER_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().or(z.literal("*")).default("http://localhost:3000"),
  DATABASE_PATH: z.string().default("./data/luxuryvoice.db"),
  UPLOAD_DIR: z.string().default("./uploads"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  DOMAIN: z.string().default("localhost"),
  TURN_URL: z.string().optional(),
  TURN_USERNAME: z.string().optional(),
  TURN_PASSWORD: z.string().optional(),
  CF_TURN_URL: z.string().optional(),
  CF_TURN_USERNAME: z.string().optional(),
  CF_TURN_PASSWORD: z.string().optional(),
  MEDIASOUP_LISTEN_IP: z.string().default("0.0.0.0"),
  MEDIASOUP_ANNOUNCED_IP: z.string().optional(),
  MEDIASOUP_MIN_PORT: z.coerce.number().int().positive().default(40000),
  MEDIASOUP_MAX_PORT: z.coerce.number().int().positive().default(49999)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${message}`);
}

export const config = parsed.data;

