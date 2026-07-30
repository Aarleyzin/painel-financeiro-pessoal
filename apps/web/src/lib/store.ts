/**
 * Camada de dados do painel — 100% no navegador (localStorage).
 *
 * Não há backend: categorias, movimentações e limites ficam salvos no
 * aparelho do usuário. Tudo em Português do Brasil (pt-BR).
 */

export type Kind = "receita" | "despesa";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  kind: Kind;
  color: string;
};

export type Transaction = {
  id: string;
  /** Data no formato AAAA-MM-DD. */
  date: string;
  description: string;
  categoryId: string;
  kind: Kind;
  /** Valor sempre positivo; o sinal vem do `kind`. */
  amount: number;
};

export type Budget = {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
};

type Snapshot = {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};

const STORAGE_KEY = "painel-financeiro.dados.v1";

/** Categorias padrão criadas no primeiro uso. */
const DEFAULT_CATEGORIES: Category[] = [
  { id: "salario", name: "Salário", emoji: "💸", kind: "receita", color: "#0f766e" },
  { id: "investimentos", name: "Investimentos", emoji: "📊", kind: "receita", color: "#0ea5a4" },
  { id: "freelas", name: "Freelas", emoji: "💼", kind: "receita", color: "#22c55e" },
  { id: "moradia", name: "Moradia", emoji: "🏠", kind: "despesa", color: "#334155" },
  { id: "alimentacao", name: "Alimentação", emoji: "🍔", kind: "despesa", color: "#f59e0b" },
  { id: "mercado", name: "Mercado", emoji: "🛒", kind: "despesa", color: "#eab308" },
  { id: "transporte", name: "Transporte", emoji: "🚗", kind: "despesa", color: "#3b82f6" },
  { id: "saude", name: "Saúde", emoji: "💊", kind: "despesa", color: "#ef4444" },
  { id: "lazer", name: "Lazer", emoji: "🎉", kind: "despesa", color: "#a855f7" },
  { id: "educacao", name: "Educação", emoji: "📚", kind: "despesa", color: "#0ea5e9" },
  { id: "assinaturas", name: "Assinaturas", emoji: "📺", kind: "despesa", color: "#ec4899" },
];

function emptySnapshot(): Snapshot {
  return { categories: [], transactions: [], budgets: [] };
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function read(): Snapshot {
  if (typeof localStorage === "undefined") return { ...emptySnapshot(), categories: DEFAULT_CATEGORIES };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Primeiro uso: semeia as categorias padrão.
    const seeded: Snapshot = { categories: DEFAULT_CATEGORIES, transactions: [], budgets: [] };
    write(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      categories: parsed.categories ?? [],
      transactions: parsed.transactions ?? [],
      budgets: parsed.budgets ?? [],
    };
  } catch {
    return { categories: DEFAULT_CATEGORIES, transactions: [], budgets: [] };
  }
}

function write(snapshot: Snapshot) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  // Avisa a interface para recarregar.
  window.dispatchEvent(new Event("painel:atualizado"));
}

/** Reexecuta um callback sempre que os dados mudarem. Retorna a função de limpeza. */
export function onChange(callback: () => void) {
  window.addEventListener("painel:atualizado", callback);
  return () => window.removeEventListener("painel:atualizado", callback);
}

/* ------------------------------ Categorias ------------------------------ */

export function getCategories(): Category[] {
  return read().categories;
}

export function categoryMap(): Map<string, Category> {
  return new Map(getCategories().map((category) => [category.id, category]));
}

export function saveCategory(input: Omit<Category, "id"> & { id?: string }) {
  const snapshot = read();
  if (input.id) {
    snapshot.categories = snapshot.categories.map((category) =>
      category.id === input.id ? { ...category, ...input, id: category.id } : category,
    );
  } else {
    snapshot.categories.push({ ...input, id: newId() });
  }
  write(snapshot);
}

export function deleteCategory(id: string) {
  const snapshot = read();
  snapshot.categories = snapshot.categories.filter((category) => category.id !== id);
  // Remove vínculos órfãos.
  snapshot.transactions = snapshot.transactions.filter((t) => t.categoryId !== id);
  snapshot.budgets = snapshot.budgets.filter((b) => b.categoryId !== id);
  write(snapshot);
}

/* ----------------------------- Movimentações ---------------------------- */

export function getTransactions(): Transaction[] {
  return read().transactions;
}

export function saveTransaction(input: Omit<Transaction, "id"> & { id?: string }) {
  const snapshot = read();
  if (input.id) {
    snapshot.transactions = snapshot.transactions.map((t) =>
      t.id === input.id ? { ...t, ...input, id: t.id } : t,
    );
  } else {
    snapshot.transactions.push({ ...input, id: newId() });
  }
  write(snapshot);
}

export function deleteTransaction(id: string) {
  const snapshot = read();
  snapshot.transactions = snapshot.transactions.filter((t) => t.id !== id);
  write(snapshot);
}

/* -------------------------------- Limites ------------------------------- */

export function getBudgets(): Budget[] {
  return read().budgets;
}

export function saveBudget(input: Omit<Budget, "id"> & { id?: string }) {
  const snapshot = read();
  if (input.id) {
    snapshot.budgets = snapshot.budgets.map((b) =>
      b.id === input.id ? { ...b, ...input, id: b.id } : b,
    );
  } else {
    snapshot.budgets.push({ ...input, id: newId() });
  }
  write(snapshot);
}

export function deleteBudget(id: string) {
  const snapshot = read();
  snapshot.budgets = snapshot.budgets.filter((b) => b.id !== id);
  write(snapshot);
}

/* ------------------------------ Agregações ------------------------------ */

export function totalReceitas(items: Transaction[] = getTransactions()) {
  return items.filter((t) => t.kind === "receita").reduce((sum, t) => sum + t.amount, 0);
}

export function totalDespesas(items: Transaction[] = getTransactions()) {
  return items.filter((t) => t.kind === "despesa").reduce((sum, t) => sum + t.amount, 0);
}

export function saldoAtual(items: Transaction[] = getTransactions()) {
  return totalReceitas(items) - totalDespesas(items);
}

/** Despesas agregadas por categoria (para o gráfico de rosca). */
export function despesasPorCategoria(items: Transaction[] = getTransactions()) {
  const map = categoryMap();
  const totals = new Map<string, number>();

  for (const t of items) {
    if (t.kind !== "despesa") continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }

  return Array.from(totals.entries())
    .map(([categoryId, value]) => {
      const category = map.get(categoryId);
      return {
        name: category ? `${category.emoji} ${category.name}` : "Outros",
        value,
        color: category?.color ?? "#94a3b8",
      };
    })
    .sort((a, b) => b.value - a.value);
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Receitas vs. despesas dos últimos `n` meses (para o gráfico de barras). */
export function historicoMensal(n = 6, items: Transaction[] = getTransactions()) {
  const now = new Date();
  const buckets: { chave: string; month: string; receitas: number; despesas: number }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      chave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: MESES[d.getMonth()],
      receitas: 0,
      despesas: 0,
    });
  }

  const index = new Map(buckets.map((b) => [b.chave, b]));
  for (const t of items) {
    const chave = t.date.slice(0, 7);
    const bucket = index.get(chave);
    if (!bucket) continue;
    if (t.kind === "receita") bucket.receitas += t.amount;
    else bucket.despesas += t.amount;
  }

  return buckets.map(({ month, receitas, despesas }) => ({ month, receitas, despesas }));
}

/* ---------------------------- Backup (JSON) ----------------------------- */

export function exportarDados(): string {
  return JSON.stringify(read(), null, 2);
}

export function importarDados(json: string) {
  const parsed = JSON.parse(json) as Partial<Snapshot>;
  const snapshot: Snapshot = {
    categories: parsed.categories ?? DEFAULT_CATEGORIES,
    transactions: parsed.transactions ?? [],
    budgets: parsed.budgets ?? [],
  };
  write(snapshot);
}
