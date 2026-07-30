import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  // Origens permitidas no CORS, separadas por vírgula.
  // Se vazio, o CORS libera todas as origens (útil em desenvolvimento).
  ALLOWED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = (env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
