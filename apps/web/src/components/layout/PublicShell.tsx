import type { PropsWithChildren } from "react";

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">
                💰 Painel Financeiro
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight md:text-6xl">
                Organize suas finanças pessoais com clareza total.
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
                Saldo, receitas, despesas por categoria e limites mensais em um painel
                visual, direto e fácil de ler. Sem ruído, foco nos seus números.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-slate-300">💵 Saldo</p>
                <p className="mt-1 font-semibold">Em tempo real</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-slate-300">📊 Gráficos</p>
                <p className="mt-1 font-semibold">Por categoria</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-slate-300">🎯 Limites</p>
                <p className="mt-1 font-semibold">Mensais</p>
              </div>
            </div>
          </section>
          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
