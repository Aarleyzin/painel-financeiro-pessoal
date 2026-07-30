import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { formatBRL, formatDateBR } from "../shared/utils";
import {
  deleteTransaction,
  getCategories,
  getTransactions,
  onChange,
  saveTransaction,
  type Category,
  type Kind,
  type Transaction,
} from "../../lib/store";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    kind: "despesa" as Kind,
    categoryId: "",
    date: hoje(),
  });

  useEffect(() => {
    const load = () => {
      setTransactions(getTransactions());
      setCategories(getCategories());
    };
    load();
    return onChange(load);
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ description: "", amount: "", kind: "despesa", categoryId: "", date: hoje() });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.description.trim() || !form.amount || !form.categoryId) return;

    saveTransaction({
      id: editingId ?? undefined,
      description: form.description.trim(),
      amount: Math.abs(Number(form.amount)),
      kind: form.kind,
      categoryId: form.categoryId,
      date: form.date,
    });
    resetForm();
  }

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setForm({
      description: t.description,
      amount: String(t.amount),
      kind: t.kind,
      categoryId: t.categoryId,
      date: t.date,
    });
  }

  const categoriasDoTipo = categories.filter((c) => c.kind === form.kind);
  const ordenadas = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const categoriaPorId = new Map(categories.map((c) => [c.id, c]));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar movimentação" : "💸 Nova movimentação"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Descrição (ex.: Mercado da semana)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                min="0"
                step="0.01"
                placeholder="Valor (R$)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as Kind, categoryId: "" })}
              >
                <option value="despesa">📉 Despesa</option>
                <option value="receita">📈 Receita</option>
              </select>
            </div>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Selecione uma categoria</option>
              {categoriasDoTipo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                className="rounded-2xl bg-brand-700 px-4 py-3 font-medium text-white disabled:opacity-60"
                type="submit"
              >
                {editingId ? "Atualizar" : "Adicionar"}
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
            {categoriasDoTipo.length === 0 ? (
              <p className="text-sm text-amber-600">
                Nenhuma categoria de {form.kind} ainda. Crie uma em Categorias.
              </p>
            ) : null}
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">🧾 Movimentações</h2>
          <div className="mt-5 space-y-3">
            {ordenadas.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma movimentação registrada ainda.</p>
            ) : (
              ordenadas.map((t) => {
                const category = categoriaPorId.get(t.categoryId);
                const isReceita = t.kind === "receita";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950">{t.description}</p>
                      <p className="text-sm text-slate-500">
                        <span aria-hidden>{category?.emoji}</span> {category?.name ?? "Outros"} •{" "}
                        {formatDateBR(t.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p
                        className={
                          isReceita
                            ? "font-semibold text-emerald-600"
                            : "font-semibold text-rose-600"
                        }
                      >
                        {isReceita ? "+" : "-"} {formatBRL(t.amount)}
                      </p>
                      <button
                        className="text-sm font-medium text-brand-700"
                        onClick={() => startEdit(t)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="text-sm font-medium text-rose-600"
                        onClick={() => deleteTransaction(t.id)}
                        type="button"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
