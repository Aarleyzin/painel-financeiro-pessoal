import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("Aarleyzin");
  const [email, setEmail] = useState("aarleyzin@meupainel.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-700">Cadastro</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Crie sua conta</h2>
        <p className="mt-2 text-sm text-slate-500">
          O primeiro acesso já prepara a base para o seu painel financeiro.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nome</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-700"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-700"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-700"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button
        className="mt-6 w-full rounded-2xl bg-brand-700 px-4 py-3 font-medium text-white transition hover:bg-brand-900 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>
      <p className="mt-4 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link className="font-medium text-brand-700" to="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
