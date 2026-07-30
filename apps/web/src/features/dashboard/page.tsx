import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/Card";
import { formatBRL, formatDateBR } from "../shared/utils";
import {
  categoryById,
  despesasPorCategoria,
  monthlyHistory,
  saldoAtual,
  totalDespesas,
  totalReceitas,
  transactions,
} from "./data";

const saldo = saldoAtual();
const receitas = totalReceitas();
const despesas = totalDespesas();
const gastosPorCategoria = despesasPorCategoria();

// Movimentações mais recentes primeiro.
const movimentacoes = [...transactions].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

function tooltipReais(value: number) {
  return formatBRL(value);
}

export function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          Painel Financeiro Pessoal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumo do mês • {formatDateBR(new Date().toISOString())}
        </p>
      </header>

      {/* Cards de resumo */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Saldo atual</p>
            <span className="text-xl" aria-hidden>💵</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{formatBRL(saldo)}</p>
          <p className="mt-1 text-sm text-slate-500">Receitas menos despesas do mês</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total de receitas</p>
            <span className="text-xl" aria-hidden>📈</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatBRL(receitas)}</p>
          <p className="mt-1 text-sm text-slate-500">Entradas registradas no período</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total de despesas</p>
            <span className="text-xl" aria-hidden>📉</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{formatBRL(despesas)}</p>
          <p className="mt-1 text-sm text-slate-500">Saídas registradas no período</p>
        </Card>
      </section>

      {/* Gráficos */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Rosca: Despesas por categoria */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">🍩 Despesas por categoria</h2>
          <p className="text-sm text-slate-500">Distribuição das saídas do mês</p>
          <div className="mt-6 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={3}
                >
                  {gastosPorCategoria.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipReais} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Barras: Receitas vs Despesas */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">📊 Receitas vs. Despesas</h2>
          <p className="text-sm text-slate-500">Comparativo dos últimos meses</p>
          <div className="mt-6 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={(value: number) => formatBRL(value)}
                />
                <Tooltip formatter={tooltipReais} cursor={{ fill: "rgba(15,118,110,0.06)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="receitas" name="Receitas" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Lista de transações */}
      <section>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">🧾 Últimas movimentações</h2>
            <span className="text-sm text-slate-500">{movimentacoes.length} lançamentos</span>
          </div>

          {/* Tabela (telas médias+) */}
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Descrição</th>
                  <th className="pb-3 font-medium">Categoria</th>
                  <th className="pb-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((item) => {
                  const category = categoryById.get(item.categoryId);
                  const isReceita = item.kind === "receita";
                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 text-slate-500">{formatDateBR(item.date)}</td>
                      <td className="py-3 font-medium text-slate-950">{item.description}</td>
                      <td className="py-3 text-slate-700">
                        <span aria-hidden>{category?.emoji}</span> {category?.name ?? "Outros"}
                      </td>
                      <td
                        className={`py-3 text-right font-semibold ${
                          isReceita ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isReceita ? "+" : "-"} {formatBRL(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lista em cartões (mobile) */}
          <div className="mt-5 space-y-3 md:hidden">
            {movimentacoes.map((item) => {
              const category = categoryById.get(item.categoryId);
              const isReceita = item.kind === "receita";
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{item.description}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span aria-hidden>{category?.emoji}</span> {category?.name ?? "Outros"} •{" "}
                      {formatDateBR(item.date)}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      isReceita ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isReceita ? "+" : "-"} {formatBRL(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </main>
  );
}
