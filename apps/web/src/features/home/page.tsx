import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Card } from "../../components/ui/Card";
import { formatBRL } from "../shared/utils";
import { saldoAtual, totalDespesas, totalReceitas } from "../dashboard/data";

const recursos = [
  {
    emoji: "💵",
    title: "Saldo sempre claro",
    description:
      "Veja saldo atual, receitas e despesas do mês em cartões diretos, sem poluição visual.",
  },
  {
    emoji: "📊",
    title: "Gráficos que explicam",
    description:
      "Despesas por categoria em rosca e o comparativo de receitas vs. despesas em barras.",
  },
  {
    emoji: "🎯",
    title: "Categorias e limites",
    description:
      "Organize gastos por categoria com emojis e defina limites mensais para não estourar o orçamento.",
  },
];

const saldo = saldoAtual();
const receitas = totalReceitas();
const despesas = totalDespesas();

export function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.18),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-medium text-teal-900 shadow-sm">
            💰 Painel Financeiro Pessoal
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
              Controle suas finanças com clareza e simplicidade.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              Registre receitas e despesas, organize por categorias com emojis e acompanhe
              tudo em um painel minimalista, direto e fácil de ler.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-brand-700 px-6 py-3 font-medium text-white shadow-lg shadow-brand-700/25 transition hover:bg-brand-900"
              to={user ? "/dashboard" : "/register"}
            >
              {user ? "Abrir painel" : "Criar conta"}
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              to="/login"
            >
              Entrar
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { emoji: "💵", label: "Saldo atual", value: formatBRL(saldo) },
              { emoji: "📈", label: "Receitas", value: formatBRL(receitas) },
              { emoji: "📉", label: "Despesas", value: formatBRL(despesas) },
            ].map((item) => (
              <Card key={item.label}>
                <p className="text-sm text-slate-500">
                  <span aria-hidden>{item.emoji}</span> {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
                  Visão geral
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                  Seu mês em um olhar.
                </h2>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
                Este mês
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">💵 Saldo atual</p>
                <p className="mt-2 text-3xl font-semibold">{formatBRL(saldo)}</p>
                <p className="mt-2 text-sm text-emerald-300">Receitas menos despesas</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">📈 Receitas</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatBRL(receitas)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">📉 Despesas</p>
                  <p className="text-sm font-semibold text-rose-600">{formatBRL(despesas)}</p>
                </div>
                <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-rose-500"
                    style={{ width: `${Math.min(100, (despesas / receitas) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {Math.round((despesas / receitas) * 100)}% das receitas já foram gastas
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-3">
        {recursos.map((item) => (
          <Card key={item.title}>
            <h3 className="text-lg font-semibold text-slate-950">
              <span aria-hidden>{item.emoji}</span> {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
