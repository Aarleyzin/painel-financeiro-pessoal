import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { formatBRL } from "../shared/utils";
import {
  deleteBudget,
  getBudgets,
  getCategories,
  getTransactions,
  onChange,
  saveBudget,
  type Budget,
  type Category,
  type Transaction,
} from "../../lib/store";

function mesAtual() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function BudgetsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: "",
    month: String(mesAtual().month),
    year: String(mesAtual().year),
    limitAmount: "",
  });

  useEffect(() => {
    const load = () => {
      setCategories(getCategories().filter((c) => c.kind === "despesa"));
      setBudgets(getBudgets());
      setTransactions(getTransactions());
    };
    load();
    return onChange(load);
  }, []);

  const categoriaPorId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const totalLimite = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

  /** Quanto já foi gasto na categoria naquele mês/ano. */
  function gastoDoLimite(b: Budget) {
    return transactions
      .filter((t) => {
        if (t.kind !== "despesa" || t.categoryId !== b.categoryId) return false;
        const [y, m] = t.date.split("-").map(Number);
        return y === b.year && m === b.month;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function reset() {
    setEditingId(null);
    setForm({ categoryId: "", month: String(mesAtual().month), year: String(mesAtual().year), limitAmount: "" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.categoryId || !form.limitAmount) return;
    saveBudget({
      id: editingId ?? undefined,
      categoryId: form.categoryId,
      month: Number(form.month),
      year: Number(form.year),
      limitAmount: Math.abs(Number(form.limitAmount)),
    });
    reset();
  }

  function startEdit(b: Budget) {
    setEditingId(b.id);
    setForm({
      categoryId: b.categoryId,
      month: String(b.month),
      year: String(b.year),
      limitAmount: String(b.limitAmount),
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar limite" : "🎯 Novo limite mensal"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Selecione uma categoria de despesa</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                min="1"
                max="12"
                placeholder="Mês"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                min="2000"
                max="2100"
                placeholder="Ano"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              type="number"
              step="0.01"
              placeholder="Valor limite (R$)"
              value={form.limitAmount}
              onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
            />
            <div className="flex gap-3">
              <button className="rounded-2xl bg-brand-700 px-4 py-3 font-medium text-white" type="submit">
                {editingId ? "Atualizar" : "Criar"}
              </button>
              {editingId ? (
                <button
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
                  type="button"
                  onClick={reset}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-amber-600">
                Crie uma categoria de despesa antes de definir limites.
              </p>
            ) : null}
          </form>
        </Card>

        <div className="grid gap-6">
          <Card>
            <p className="text-sm text-slate-500">💰 Limite total ativo</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{formatBRL(totalLimite)}</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-slate-950">📋 Limites por categoria</h3>
            <div className="mt-4 space-y-3">
              {budgets.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum limite cadastrado ainda.</p>
              ) : (
                budgets.map((b) => {
                  const category = categoriaPorId.get(b.categoryId);
                  const gasto = gastoDoLimite(b);
                  const pct = b.limitAmount > 0 ? Math.min(100, (gasto / b.limitAmount) * 100) : 0;
                  const estourou = gasto > b.limitAmount;
                  return (
                    <div key={b.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-950">
                          <span aria-hidden>{category?.emoji}</span> {category?.name ?? "Categoria"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {String(b.month).padStart(2, "0")}/{b.year}
                        </p>
                      </div>
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-2.5 rounded-full ${estourou ? "bg-rose-500" : "bg-brand-700"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className={estourou ? "font-medium text-rose-600" : "text-slate-500"}>
                          {formatBRL(gasto)} de {formatBRL(b.limitAmount)}
                        </span>
                        <span className="flex gap-4">
                          <button
                            className="font-medium text-brand-700"
                            onClick={() => startEdit(b)}
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            className="font-medium text-rose-600"
                            onClick={() => deleteBudget(b.id)}
                            type="button"
                          >
                            Excluir
                          </button>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
