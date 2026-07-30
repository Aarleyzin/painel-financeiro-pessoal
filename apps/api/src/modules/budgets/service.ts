import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const budgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  limitAmount: z.coerce.number().positive(),
});

async function ensureAuth(userId?: string) {
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return userId;
}

async function ensureCategoryOwnership(userId: string, categoryId: string | undefined) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }
}

async function resolveBudgetOrThrow(userId: string, id: string) {
  const budget = await prisma.monthlyLimit.findFirst({ where: { id, userId } });
  if (!budget) {
    throw Object.assign(new Error("Budget not found"), { status: 404 });
  }
  return budget;
}

export async function listBudgetsService(userId?: string, query: Record<string, unknown> = {}) {
  const authUserId = await ensureAuth(userId);
  const month = typeof query.month === "string" ? Number(query.month) : undefined;
  const year = typeof query.year === "string" ? Number(query.year) : undefined;

  const items = await prisma.monthlyLimit.findMany({
    where: {
      userId: authUserId,
      ...(month ? { month } : {}),
      ...(year ? { year } : {}),
    },
    include: { category: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return {
    items: items.map((budget: {
      id: string;
      categoryId: string;
      month: number;
      year: number;
      limitAmount: { toNumber: () => number } | number;
      category: { name: string };
    }) => ({
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      month: budget.month,
      year: budget.year,
      limitAmount: Number(budget.limitAmount),
    })),
  };
}

export async function createBudgetService(userId: string | undefined, payload: unknown) {
  const authUserId = await ensureAuth(userId);
  const data = budgetSchema.parse(payload);
  await ensureCategoryOwnership(authUserId, data.categoryId);

  const item = await prisma.monthlyLimit.create({
    data: {
      userId: authUserId,
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
      limitAmount: data.limitAmount,
    },
    include: { category: true },
  });

  return {
    item: {
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      month: item.month,
      year: item.year,
      limitAmount: Number(item.limitAmount),
    },
  };
}

export async function updateBudgetService(
  userId: string | undefined,
  id: string,
  payload: unknown,
) {
  const authUserId = await ensureAuth(userId);
  await resolveBudgetOrThrow(authUserId, id);
  const data = budgetSchema.partial().parse(payload);
  if (data.categoryId !== undefined) {
    await ensureCategoryOwnership(authUserId, data.categoryId);
  }

  const item = await prisma.monthlyLimit.update({
    where: { id },
    data: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(typeof data.month === "number" ? { month: data.month } : {}),
      ...(typeof data.year === "number" ? { year: data.year } : {}),
      ...(typeof data.limitAmount === "number" ? { limitAmount: data.limitAmount } : {}),
    },
    include: { category: true },
  });

  return {
    item: {
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      month: item.month,
      year: item.year,
      limitAmount: Number(item.limitAmount),
    },
  };
}

export async function deleteBudgetService(userId: string | undefined, id: string) {
  const authUserId = await ensureAuth(userId);
  await resolveBudgetOrThrow(authUserId, id);
  await prisma.monthlyLimit.delete({ where: { id } });
}
