/**
 * Estrutura de dados (mock) do Painel Financeiro Pessoal.
 *
 * Simula o "banco de dados" das movimentações e das categorias.
 * Todo o conteúdo está em Português do Brasil (pt-BR).
 *
 * Em produção, estes dados viriam da API (`/api/transactions` e
 * `/api/categories`) — a forma dos objetos foi mantida próxima da real
 * para facilitar a troca do mock pela integração.
 */

export type Kind = "receita" | "despesa";

export type Category = {
  id: string;
  /** Nome exibido, em pt-BR. */
  name: string;
  /** Emoji usado para leitura rápida da categoria. */
  emoji: string;
  /** Tipo da categoria: receita ou despesa. */
  kind: Kind;
  /** Cor usada nos gráficos (paleta da marca + apoios). */
  color: string;
};

export type Transaction = {
  id: string;
  /** Data da movimentação em formato ISO (AAAA-MM-DD). */
  date: string;
  /** Descrição curta da movimentação. */
  description: string;
  /** Referência à categoria (`Category.id`). */
  categoryId: string;
  kind: Kind;
  /** Valor sempre positivo, em Reais. O sinal vem do `kind`. */
  amount: number;
};

/**
 * Catálogo padrão de categorias com os emojis correspondentes.
 * Serve como base para novos usuários do painel.
 */
export const categories: Category[] = [
  // Receitas
  { id: "salario", name: "Salário", emoji: "💸", kind: "receita", color: "#0f766e" },
  { id: "investimentos", name: "Investimentos", emoji: "📊", kind: "receita", color: "#0ea5a4" },
  { id: "freelas", name: "Freelas", emoji: "💼", kind: "receita", color: "#22c55e" },
  // Despesas
  { id: "moradia", name: "Moradia", emoji: "🏠", kind: "despesa", color: "#334155" },
  { id: "alimentacao", name: "Alimentação", emoji: "🍔", kind: "despesa", color: "#f59e0b" },
  { id: "mercado", name: "Mercado", emoji: "🛒", kind: "despesa", color: "#eab308" },
  { id: "transporte", name: "Transporte", emoji: "🚗", kind: "despesa", color: "#3b82f6" },
  { id: "saude", name: "Saúde", emoji: "💊", kind: "despesa", color: "#ef4444" },
  { id: "lazer", name: "Lazer", emoji: "🎉", kind: "despesa", color: "#a855f7" },
  { id: "educacao", name: "Educação", emoji: "📚", kind: "despesa", color: "#0ea5e9" },
  { id: "assinaturas", name: "Assinaturas", emoji: "📺", kind: "despesa", color: "#ec4899" },
];

/** Índice auxiliar para buscar uma categoria pelo id em O(1). */
export const categoryById = new Map(categories.map((category) => [category.id, category]));

/**
 * Movimentações recentes (mês corrente).
 * Ordenadas da mais recente para a mais antiga na exibição.
 */
export const transactions: Transaction[] = [
  { id: "t01", date: "2026-07-05", description: "Salário mensal", categoryId: "salario", kind: "receita", amount: 8200 },
  { id: "t02", date: "2026-07-06", description: "Aluguel do apartamento", categoryId: "moradia", kind: "despesa", amount: 2400 },
  { id: "t03", date: "2026-07-08", description: "Compras da semana", categoryId: "mercado", kind: "despesa", amount: 640.9 },
  { id: "t04", date: "2026-07-10", description: "Rendimento CDB", categoryId: "investimentos", kind: "receita", amount: 950 },
  { id: "t05", date: "2026-07-12", description: "Combustível", categoryId: "transporte", kind: "despesa", amount: 320.5 },
  { id: "t06", date: "2026-07-14", description: "Jantar com amigos", categoryId: "alimentacao", kind: "despesa", amount: 189.9 },
  { id: "t07", date: "2026-07-15", description: "Projeto freelance", categoryId: "freelas", kind: "receita", amount: 1800 },
  { id: "t08", date: "2026-07-16", description: "Plano de saúde", categoryId: "saude", kind: "despesa", amount: 430 },
  { id: "t09", date: "2026-07-18", description: "Cinema e streaming", categoryId: "lazer", kind: "despesa", amount: 96 },
  { id: "t10", date: "2026-07-20", description: "Assinaturas (Spotify + Netflix)", categoryId: "assinaturas", kind: "despesa", amount: 89.9 },
  { id: "t11", date: "2026-07-22", description: "Curso online de finanças", categoryId: "educacao", kind: "despesa", amount: 149 },
  { id: "t12", date: "2026-07-25", description: "Feira e hortifruti", categoryId: "mercado", kind: "despesa", amount: 210.3 },
];

/**
 * Histórico de Receitas vs. Despesas dos últimos meses.
 * Usado no gráfico de barras.
 */
export const monthlyHistory = [
  { month: "Fev", receitas: 9800, despesas: 6800 },
  { month: "Mar", receitas: 10200, despesas: 7100 },
  { month: "Abr", receitas: 10500, despesas: 6900 },
  { month: "Mai", receitas: 11800, despesas: 7900 },
  { month: "Jun", receitas: 10900, despesas: 7300 },
  { month: "Jul", receitas: 10950, despesas: 5479.4 },
];

/** Total de receitas do período corrente. */
export function totalReceitas(items: Transaction[] = transactions) {
  return items
    .filter((item) => item.kind === "receita")
    .reduce((sum, item) => sum + item.amount, 0);
}

/** Total de despesas do período corrente. */
export function totalDespesas(items: Transaction[] = transactions) {
  return items
    .filter((item) => item.kind === "despesa")
    .reduce((sum, item) => sum + item.amount, 0);
}

/** Saldo atual = receitas - despesas. */
export function saldoAtual(items: Transaction[] = transactions) {
  return totalReceitas(items) - totalDespesas(items);
}

/**
 * Agrega as despesas por categoria para o gráfico de rosca/pizza.
 * Retorna já ordenado do maior para o menor valor.
 */
export function despesasPorCategoria(items: Transaction[] = transactions) {
  const totals = new Map<string, number>();

  for (const item of items) {
    if (item.kind !== "despesa") continue;
    totals.set(item.categoryId, (totals.get(item.categoryId) ?? 0) + item.amount);
  }

  return Array.from(totals.entries())
    .map(([categoryId, value]) => {
      const category = categoryById.get(categoryId);
      return {
        name: category ? `${category.emoji} ${category.name}` : "Outros",
        value,
        color: category?.color ?? "#94a3b8",
      };
    })
    .sort((a, b) => b.value - a.value);
}
