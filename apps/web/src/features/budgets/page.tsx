import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { Card } from "../../components/ui/Card";
import { formatBRL } from "../shared/utils";

type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
};

type Budget = {
  id: string;
  categoryId: string;
  categoryName: string;
  month: number;
  year: number;
  limitAmount: number;
};

function currentMonth() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function BudgetsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Budget[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: "",
    month: String(currentMonth().month),
    year: String(currentMonth().year),
    limitAmount: "",
  });

  const totals = useMemo(
    () => ({
      monthlyLimit: items.reduce((sum, item) => sum + item.limitAmount, 0),
      activeBudgets: items.length,
    }),
    [items],
  );

  async function load() {
    const [categoryResponse, budgetResponse] = await Promise.all([
      apiRequest<{ items: Category[] }>("/api/categories", { token }),
      apiRequest<{ items: Budget[] }>("/api/budgets", { token }),
    ]);
    setCategories(categoryResponse.items.filter((category) => category.kind === "expense"));
    setItems(budgetResponse.items);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function reset() {
    setEditingId(null);
    setForm({
      categoryId: "",
      month: String(currentMonth().month),
      year: String(currentMonth().year),
      limitAmount: "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      categoryId: form.categoryId,
      month: Number(form.month),
      year: Number(form.year),
      limitAmount: Number(form.limitAmount),
    };

    if (editingId) {
      await apiRequest(`/api/budgets/${editingId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });
    } else {
      await apiRequest("/api/budgets", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
    }

    reset();
    await load();
  }

  function editBudget(budget: Budget) {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.categoryId,
      month: String(budget.month),
      year: String(budget.year),
      limitAmount: String(budget.limitAmount),
    });
  }

  async function removeBudget(id: string) {
    await apiRequest(`/api/budgets/${id}`, { method: "DELETE", token });
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar limite" : "🎯 Novo limite mensal"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
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
                onChange={(event) => setForm({ ...form, month: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                min="2000"
                max="2100"
                placeholder="Ano"
                value={form.year}
                onChange={(event) => setForm({ ...form, year: event.target.value })}
              />
            </div>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              type="number"
              step="0.01"
              placeholder="Valor limite"
              value={form.limitAmount}
              onChange={(event) => setForm({ ...form, limitAmount: event.target.value })}
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
          </form>
        </Card>

        <div className="grid gap-6">
          <Card>
            <p className="text-sm text-slate-500">💰 Limite total ativo</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {formatBRL(totals.monthlyLimit)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">🎯 Limites cadastrados</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{totals.activeBudgets}</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-slate-950">📋 Limites por categoria</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-950">{item.categoryName}</p>
                    <p className="font-semibold text-brand-700">{formatBRL(item.limitAmount)}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {String(item.month).padStart(2, "0")}/{item.year}
                  </p>
                  <div className="mt-3 flex gap-4">
                    <button className="text-sm font-medium text-brand-700" onClick={() => editBudget(item)} type="button">
                      Editar
                    </button>
                    <button className="text-sm font-medium text-rose-600" onClick={() => removeBudget(item.id)} type="button">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
