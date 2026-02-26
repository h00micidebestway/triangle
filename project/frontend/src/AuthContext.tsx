import { createContext, useContext, useState, ReactNode } from "react";
import api from "./api";

interface User { id: number; name: string; email: string; phone: string; }
interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, phone = "") => {
    const { data } = await api.post("/api/auth/register", { name, email, password, phone });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
