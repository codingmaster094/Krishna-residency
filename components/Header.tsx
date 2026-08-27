"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { InstallAppButton } from "@/components/PwaInstall";
import { useAuth } from "@/components/AuthProvider";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const { admin, refresh } = useAuth();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-br from-[#0a1b30] via-[#0f2744] to-[#1a3a5c] text-white shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center font-bold text-gold text-sm">
            KR
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-gold tracking-[0.12em] font-medium truncate">MAINTENANCE MANAGE SYSTEM</p>
            <h1 className="font-guj text-base sm:text-lg font-bold leading-tight truncate">{title}</h1>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <InstallAppButton variant="header" />
          {admin ? (
            <>
              <span className="hidden xs:inline text-[10px] text-gold max-w-[72px] truncate">{admin.name}</span>
              <button onClick={logout} className="text-[11px] bg-white/10 border border-white/10 rounded-full px-2.5 py-1.5">
                લૉગઆઉટ
              </button>
            </>
          ) : (
            <Link href="/login" className="text-[11px] font-semibold bg-gold text-navy rounded-full px-3 py-1.5">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
