import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const transactionSchema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().positive(),
  kind: z.enum(["income", "expense"]),
  categoryId: z.string().nullable().optional(),
  occurredAt: z.string().datetime(),
  notes: z.string().optional().nullable(),
});

const updateSchema = transactionSchema.partial().extend({
  title: z.string().min(2).optional(),
  amount: z.coerce.number().positive().optional(),
  kind: z.enum(["income", "expense"]).optional(),
  occurredAt: z.string().datetime().optional(),
});

function toPrismaKind(kind: "income" | "expense") {
  return kind === "income" ? "INCOME" : "EXPENSE";
}

async function ensureOwnership(userId: string | undefined) {
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return userId;
}

async function ensureCategoryOwnership(userId: string, categoryId: string | null | undefined) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }
}

async function resolveTransactionOrThrow(userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    throw Object.assign(new Error("Transaction not found"), { status: 404 });
  }

  return transaction;
}

export async function listTransactionsService(
  userId: string | undefined,
  query: Record<string, unknown>,
) {
  const authUserId = await ensureOwnership(userId);

  const kind = typeof query.kind === "string" ? query.kind : undefined;
  const categoryId = typeof query.categoryId === "string" ? query.categoryId : undefined;
  const from = typeof query.from === "string" ? new Date(query.from) : undefined;
  const to = typeof query.to === "string" ? new Date(query.to) : undefined;

  const items = await prisma.transaction.findMany({
    where: {
      userId: authUserId,
      ...(kind ? { kind: toPrismaKind(kind as "income" | "expense") } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      occurredAt: "desc",
    },
  });

  return {
    items: items.map((transaction: {
      id: string;
      title: string;
      amount: { toNumber: () => number } | number;
      kind: string;
      categoryId: string | null;
      category?: { name: string } | null;
      occurredAt: Date;
      notes: string | null;
    }) => ({
      id: transaction.id,
      title: transaction.title,
      amount: Number(transaction.amount),
      kind: transaction.kind === "INCOME" ? "income" : "expense",
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      occurredAt: transaction.occurredAt.toISOString(),
      notes: transaction.notes,
    })),
  };
}

export async function createTransactionService(userId: string | undefined, payload: unknown) {
  const authUserId = await ensureOwnership(userId);
  const data = transactionSchema.parse(payload);
  await ensureCategoryOwnership(authUserId, data.categoryId);

  const transaction = await prisma.transaction.create({
    data: {
      userId: authUserId,
      title: data.title,
      amount: data.amount,
      kind: toPrismaKind(data.kind),
      categoryId: data.categoryId ?? null,
      occurredAt: new Date(data.occurredAt),
      notes: data.notes ?? null,
    },
    include: {
      category: true,
    },
  });

  return {
    item: {
      id: transaction.id,
      title: transaction.title,
      amount: Number(transaction.amount),
      kind: transaction.kind === "INCOME" ? "income" : "expense",
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      occurredAt: transaction.occurredAt.toISOString(),
      notes: transaction.notes,
    },
  };
}

export async function updateTransactionService(
  userId: string | undefined,
  id: string,
  payload: unknown,
) {
  const authUserId = await ensureOwnership(userId);
  await resolveTransactionOrThrow(authUserId, id);
  const data = updateSchema.parse(payload);
  if (data.categoryId !== undefined) {
    await ensureCategoryOwnership(authUserId, data.categoryId);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(typeof data.amount === "number" ? { amount: data.amount } : {}),
      ...(data.kind ? { kind: toPrismaKind(data.kind) } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.occurredAt ? { occurredAt: new Date(data.occurredAt) } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
    include: {
      category: true,
    },
  });

  return {
    item: {
      id: transaction.id,
      title: transaction.title,
      amount: Number(transaction.amount),
      kind: transaction.kind === "INCOME" ? "income" : "expense",
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      occurredAt: transaction.occurredAt.toISOString(),
      notes: transaction.notes,
    },
  };
}

export async function deleteTransactionService(userId: string | undefined, id: string) {
  const authUserId = await ensureOwnership(userId);
  await resolveTransactionOrThrow(authUserId, id);
  await prisma.transaction.delete({ where: { id } });
}
