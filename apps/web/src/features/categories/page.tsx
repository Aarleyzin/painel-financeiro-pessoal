import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { Card } from "../../components/ui/Card";

type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string | null;
};

export function CategoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState("#0f766e");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const response = await apiRequest<{ items: Category[] }>("/api/categories", { token });
    setItems(response.items);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { name, kind, color };
    if (editingId) {
      await apiRequest(`/api/categories/${editingId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });
    } else {
      await apiRequest("/api/categories", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
    }
    setName("");
    setKind("expense");
    setColor("#0f766e");
    setEditingId(null);
    await load();
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setKind(category.kind);
    setColor(category.color ?? "#0f766e");
  }

  async function removeCategory(id: string) {
    await apiRequest(`/api/categories/${id}`, { method: "DELETE", token });
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "✏️ Editar categoria" : "🏷️ Nova categoria"}
          </h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Nome da categoria"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={kind}
              onChange={(event) => setKind(event.target.value as "income" | "expense")}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <input
              className="h-12 rounded-2xl border border-slate-200 px-4 py-2"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
            <button className="rounded-2xl bg-brand-700 px-4 py-3 font-medium text-white" type="submit">
              {editingId ? "Atualizar" : "Criar"}
            </button>
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
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: item.color ?? "#0f766e" }}
                  />
                  <div>
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.kind === "income" ? "📈 Receita" : "📉 Despesa"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="text-sm font-medium text-brand-700" onClick={() => editCategory(item)} type="button">
                    Editar
                  </button>
                  <button
                    className="text-sm font-medium text-rose-600"
                    onClick={() => removeCategory(item.id)}
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
