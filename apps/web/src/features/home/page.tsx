import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

const recursos = [
  {
    emoji: "💵",
    title: "Saldo sempre claro",
    description: "Saldo, receitas e despesas do mês em cartões diretos, sem poluição visual.",
  },
  {
    emoji: "📊",
    title: "Gráficos que explicam",
    description: "Despesas por categoria em rosca e receitas vs. despesas em barras.",
  },
  {
    emoji: "🔒",
    title: "Seus dados no seu aparelho",
    description:
      "Tudo fica salvo no seu navegador (sem servidor). Você pode exportar e importar um backup quando quiser.",
  },
];

export function HomePage() {
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
              Registre receitas e despesas, organize por categorias com emojis e acompanhe tudo
              em um painel minimalista. Sem cadastro, sem servidor — direto no seu navegador.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-brand-700 px-6 py-3 font-medium text-white shadow-lg shadow-brand-700/25 transition hover:bg-brand-900"
              to="/dashboard"
            >
              Abrir meu painel
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {recursos.map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold text-slate-950">
                <span aria-hidden>{item.emoji}</span> {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
