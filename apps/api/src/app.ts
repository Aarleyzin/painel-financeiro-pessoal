import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { allowedOrigins } from "./config/env.js";

export const app = express();
export default app;

// Headers de segurança (HSTS, no-sniff, etc.).
app.use(helmet());

// Confia no proxy do host (Render) para IP correto no rate limit.
app.set("trust proxy", 1);

// CORS: se ALLOWED_ORIGINS estiver definido, restringe; senão libera geral.
app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin(origin, callback) {
            // Permite ferramentas sem Origin (curl, health checks).
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error("Origin não permitida pelo CORS"));
          },
        }
      : undefined,
  ),
);

app.use(express.json());

// Limita tentativas de autenticação (mitiga brute force).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Tente novamente em alguns minutos." },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Health under /api for hosts que usam prefixo
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiRouter);
app.use(errorHandler);
