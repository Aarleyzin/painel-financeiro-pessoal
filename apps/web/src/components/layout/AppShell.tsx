import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-950">💰 Painel Financeiro</p>
            <p className="text-sm text-slate-500">Suas finanças pessoais</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

