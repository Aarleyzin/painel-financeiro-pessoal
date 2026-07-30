import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth";

const linkBase = "rounded-full px-4 py-2 text-sm font-medium transition-colors";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${
    isActive ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

export function ProtectedShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.1),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-950">💰 Painel Financeiro</p>
            <p className="text-sm text-slate-500">Suas finanças pessoais</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/dashboard" className={linkClass}>
              📊 Painel
            </NavLink>
            <NavLink to="/transactions" className={linkClass}>
              💸 Receitas e despesas
            </NavLink>
            <NavLink to="/categories" className={linkClass}>
              🏷️ Categorias
            </NavLink>
            <NavLink to="/budgets" className={linkClass}>
              🎯 Limites
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-950">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={logout}
              type="button"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
