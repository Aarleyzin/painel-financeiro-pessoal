import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { Card } from "../../components/ui/Card";
import { formatBRL, toDateTimeLocalValue } from "../shared/utils";

type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
};

type Transaction = {
  id: string;
  title: string;
  amount: number;
  kind: "income" | "expense";
  categoryId: string | null;
  categoryName: string | null;
  occurredAt: string;
  notes: string | null;
};

export function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    kind: "expense" as "income" | "expense",
    categoryId: "",
    occurredAt: toDateTimeLocalValue(),
    notes: "",
  });

  async function loadData() {
    setLoading(true);
    const [transactionResponse, categoryResponse] = await Promise.all([
      apiRequest<{ items: Transaction[] }>("/api/transactions", { token }),
      apiRequest<{ items: Category[] }>("/api/categories", { token }),
    ]);
    setTransactions(transactionResponse.items);
    setCategories(categoryResponse.items);
    setLoading(false);
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      amount: "",
      kind: "expense",
      categoryId: "",
      occurredAt: toDateTimeLocalValue(),
      notes: "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      amount: Number(form.amount),
      kind: form.kind,
      categoryId: form.categoryId || null,
      occurredAt: new Date(form.occurredAt).toISOString(),
      notes: form.notes || null,
    };

    try {
      if (editingId) {
        await apiRequest(`/api/transactions/${editingId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/transactions", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
      }

      await loadData();
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({
      title: transaction.title,
      amount: String(transaction.amount),
      kind: transaction.kind,
      categoryId: transaction.categoryId ?? "",
      occurredAt: toDateTimeLocalValue(new Date(transaction.occurredAt)),
      notes: transaction.notes ?? "",
    });
  }

  async function handleDelete(id: string) {
    await apiRequest(`/api/transactions/${id}`, { method: "DELETE", token });
    await loadData();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar transação" : "💸 Nova transação"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Título"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                min="0"
                step="0.01"
                placeholder="Valor"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.kind}
                onChange={(event) =>
                  setForm({ ...form, kind: event.target.value as "income" | "expense" })
                }
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              type="datetime-local"
              value={form.occurredAt}
              onChange={(event) => setForm({ ...form, occurredAt: event.target.value })}
            />
            <textarea
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Observações"
              rows={4}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            <div className="flex gap-3">
              <button
                className="rounded-2xl bg-brand-700 px-4 py-3 font-medium text-white disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Adicionar"}
              </button>
              {editingId ? (
                <button
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
                  type="button"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">🧾 Movimentações</h2>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">{transaction.title}</p>
                    <p className="text-sm text-slate-500">
                      {transaction.categoryName ?? "Sem categoria"} • {" "}
                      {new Date(transaction.occurredAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={
                        transaction.kind === "income"
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-rose-600"
                      }
                    >
                      {transaction.kind === "income" ? "+" : "-"} {formatBRL(transaction.amount)}
                    </p>
                    <button
                      className="text-sm font-medium text-brand-700"
                      onClick={() => startEdit(transaction)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className="text-sm font-medium text-rose-600"
                      onClick={() => handleDelete(transaction.id)}
                      type="button"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
