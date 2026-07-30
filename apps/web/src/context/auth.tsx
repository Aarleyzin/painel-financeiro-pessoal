import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { apiRequest } from "../lib/api";
import type { AuthResponse, User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "meu-painel-financeiro.auth";

type StoredAuth = {
  token: string;
  user: User;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    const stored = JSON.parse(raw) as StoredAuth;
    setToken(stored.token);
    setUser(stored.user);

    apiRequest<{ user: User }>("/api/auth/me", { token: stored.token })
      .then((response) => {
        setUser(response.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: stored.token, user: response.user }));
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function persistAuth(response: AuthResponse) {
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
  }

  async function login(email: string, password: string) {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await persistAuth(response);
  }

  async function register(name: string, email: string, password: string) {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await persistAuth(response);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

