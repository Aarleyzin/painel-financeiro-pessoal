import { useEffect, useState } from "react";
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
  categoryMap,
  despesasPorCategoria,
  getTransactions,
  historicoMensal,
  onChange,
  saldoAtual,
  totalDespesas,
  totalReceitas,
  type Transaction,
} from "../../lib/store";

function tooltipReais(value: number) {
  return formatBRL(value);
}

export function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = () => setTransactions(getTransactions());
    load();
    return onChange(load);
  }, []);

  const saldo = saldoAtual(transactions);
  const receitas = totalReceitas(transactions);
  const despesas = totalDespesas(transactions);
  const gastosPorCategoria = despesasPorCategoria(transactions);
  const historico = historicoMensal(6, transactions);
  const categorias = categoryMap();

  const movimentacoes = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const temDados = transactions.length > 0;

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
          <p className="mt-1 text-sm text-slate-500">Receitas menos despesas</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total de receitas</p>
            <span className="text-xl" aria-hidden>📈</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatBRL(receitas)}</p>
          <p className="mt-1 text-sm text-slate-500">Entradas registradas</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total de despesas</p>
            <span className="text-xl" aria-hidden>📉</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{formatBRL(despesas)}</p>
          <p className="mt-1 text-sm text-slate-500">Saídas registradas</p>
        </Card>
      </section>

      {!temDados ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-4xl" aria-hidden>🧾</span>
            <p className="text-lg font-semibold text-slate-950">Nenhuma movimentação ainda</p>
            <p className="max-w-md text-sm text-slate-500">
              Adicione sua primeira receita ou despesa em <strong>Receitas e despesas</strong> e
              os gráficos e totais aparecem aqui automaticamente.
            </p>
          </div>
        </Card>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Rosca: Despesas por categoria */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">🍩 Despesas por categoria</h2>
            <p className="text-sm text-slate-500">Distribuição das saídas</p>
            <div className="mt-6 h-72 sm:h-80">
              {gastosPorCategoria.length === 0 ? (
                <p className="grid h-full place-items-center text-sm text-slate-400">
                  Sem despesas registradas.
                </p>
              ) : (
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
              )}
            </div>
          </Card>

          {/* Barras: Receitas vs Despesas */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">📊 Receitas vs. Despesas</h2>
            <p className="text-sm text-slate-500">Últimos meses</p>
            <div className="mt-6 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historico} barGap={6}>
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
      )}

      {/* Lista de transações */}
      {temDados ? (
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
                  {movimentacoes.slice(0, 10).map((item) => {
                    const category = categorias.get(item.categoryId);
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
              {movimentacoes.slice(0, 10).map((item) => {
                const category = categorias.get(item.categoryId);
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
      ) : null}
    </main>
  );
}
