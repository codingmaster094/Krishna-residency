"use client";

import { useRouter } from "next/navigation";
import { InstallAppButton } from "@/components/PwaInstall";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }
  return (
    <header className="sticky top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-br from-[#0a1b30] via-[#0f2744] to-[#1a3a5c] text-white shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center font-bold text-gold text-sm">
            KR
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-gold tracking-[0.16em] font-medium truncate">KRISHNA RESIDENCY</p>
            <h1 className="font-guj text-base sm:text-lg font-bold leading-tight truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <InstallAppButton variant="header" />
          <button onClick={logout} className="text-[11px] bg-white/10 border border-white/10 rounded-full px-2.5 py-1.5">
            લૉગઆઉટ
          </button>
        </div>
      </div>
    </header>
  );
}
