import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import {
  deleteCategory,
  getCategories,
  onChange,
  saveCategory,
  type Category,
  type Kind,
} from "../../lib/store";

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    emoji: "🏷️",
    kind: "despesa" as Kind,
    color: "#0f766e",
  });

  useEffect(() => {
    const load = () => setItems(getCategories());
    load();
    return onChange(load);
  }, []);

  function reset() {
    setEditingId(null);
    setForm({ name: "", emoji: "🏷️", kind: "despesa", color: "#0f766e" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    saveCategory({
      id: editingId ?? undefined,
      name: form.name.trim(),
      emoji: form.emoji.trim() || "🏷️",
      kind: form.kind,
      color: form.color,
    });
    reset();
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({ name: c.name, emoji: c.emoji, kind: c.kind, color: c.color });
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar categoria" : "🏷️ Nova categoria"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-xl"
                aria-label="Emoji"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Nome da categoria"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}
            >
              <option value="despesa">📉 Despesa</option>
              <option value="receita">📈 Receita</option>
            </select>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              Cor:
              <input
                className="h-10 w-16 rounded-lg border border-slate-200"
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </label>
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

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">🏷️ Categorias</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-lg"
                    style={{ backgroundColor: `${item.color}22` }}
                    aria-hidden
                  >
                    {item.emoji}
                  </span>
                  <div>
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.kind === "receita" ? "📈 Receita" : "📉 Despesa"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    className="text-sm font-medium text-brand-700"
                    onClick={() => startEdit(item)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="text-sm font-medium text-rose-600"
                    onClick={() => deleteCategory(item.id)}
                    type="button"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
