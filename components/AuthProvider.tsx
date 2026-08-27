"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type SessionAdmin = { id: string; name: string; email: string; mobile: string; role: string };

const Ctx = createContext<{ admin: SessionAdmin | null; loading: boolean; refresh: () => Promise<void> }>({
  admin: null,
  loading: true,
  refresh: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SessionAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await fetch("/api/auth/me");
    const data = await res.json().catch(() => ({ admin: null }));
    setAdmin(data.admin || null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={{ admin, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
