"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type SessionAdmin = { id: string; name: string; email: string; mobile: string; role: string };

type AuthCtx = {
  admin: SessionAdmin | null;
  loading: boolean;
  refresh: () => Promise<SessionAdmin | null>;
  setAdmin: (admin: SessionAdmin | null) => void;
};

const Ctx = createContext<AuthCtx>({
  admin: null,
  loading: true,
  refresh: async () => null,
  setAdmin: () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SessionAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({ admin: null }));
      const next = (data.admin as SessionAdmin | null) || null;
      setAdmin(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ admin, loading, refresh, setAdmin }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
