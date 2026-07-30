import { useRef, type ChangeEvent } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { exportarDados, importarDados } from "../../lib/store";

const linkBase = "rounded-full px-4 py-2 text-sm font-medium transition-colors";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${
    isActive ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

export function ProtectedShell() {
  const fileInput = useRef<HTMLInputElement>(null);

  function baixarBackup() {
    const blob = new Blob([exportarDados()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `painel-financeiro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function aoImportar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importarDados(String(reader.result));
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.1),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
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
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={baixarBackup}
              type="button"
              title="Baixar um arquivo com todos os seus dados"
            >
              ⬇️ Backup
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => fileInput.current?.click()}
              type="button"
              title="Restaurar dados de um arquivo de backup"
            >
              ⬆️ Importar
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={aoImportar}
            />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
