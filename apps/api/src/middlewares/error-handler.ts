import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // Erros de validação viram 400 com detalhes úteis (sem stack).
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const status = typeof error?.status === "number" ? error.status : 500;

  // Em 5xx não expomos a mensagem interna (pode vazar detalhes do banco).
  if (status >= 500) {
    console.error("Unhandled error:", error);
    return res.status(status).json({ message: "Erro interno do servidor" });
  }

  res.status(status).json({
    message: error?.message ?? "Erro inesperado",
  });
};
