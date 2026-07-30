import { prisma } from "../../lib/prisma.js";
import type { FinanceSummary } from "@painel/shared";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function getDashboardService(userId?: string): Promise<{
  summary: FinanceSummary;
  recentTransactions: Array<{
    id: string;
    title: string;
    amount: number;
    kind: "income" | "expense";
    occurredAt: string;
    categoryName: string | null;
  }>;
  categoryBreakdown: Array<{
    categoryId: string | null;
    categoryName: string;
    total: number;
  }>;
}> {
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  const { start, end } = currentMonthRange();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      occurredAt: "desc",
    },
  });

  let incomeTotal = 0;
  let expenseTotal = 0;

  const breakdownMap = new Map<string, { categoryId: string | null; categoryName: string; total: number }>();

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    if (transaction.kind === "INCOME") {
      incomeTotal += amount;
      continue;
    }

    expenseTotal += amount;
    const key = transaction.categoryId ?? "uncategorized";
    const current =
      breakdownMap.get(key) ??
      ({
        categoryId: transaction.categoryId,
        categoryName: transaction.category?.name ?? "Sem categoria",
        total: 0,
      } satisfies { categoryId: string | null; categoryName: string; total: number });
    current.total += amount;
    breakdownMap.set(key, current);
  }

  return {
    summary: {
      balance: incomeTotal - expenseTotal,
      incomeTotal,
      expenseTotal,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    },
    recentTransactions: transactions.slice(0, 8).map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      amount: Number(transaction.amount),
      kind: transaction.kind === "INCOME" ? "income" : "expense",
      occurredAt: transaction.occurredAt.toISOString(),
      categoryName: transaction.category?.name ?? null,
    })),
    categoryBreakdown: Array.from(breakdownMap.values()).sort(
      (
        a: { categoryId: string | null; categoryName: string; total: number },
        b: { categoryId: string | null; categoryName: string; total: number },
      ) => b.total - a.total,
    ),
  };
}
