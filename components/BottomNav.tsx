"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "હોમ", icon: "⌂" },
  { href: "/collections", label: "કલેક્શન", icon: "₹" },
  { href: "/expenses", label: "ખર્ચ", icon: "▤" },
  { href: "/vehicles", label: "વાહન", icon: "▣" },
  { href: "/more", label: "વધુ", icon: "☰" },
];

export function BottomNav() {
  const path = usePathname();
  if (path === "/login") return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-3 pb-3">
        <div className="grid grid-cols-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_-8px_40px_rgba(15,39,68,0.12)] border border-white px-1 py-1.5">
          {items.map((it) => {
            const on = path === it.href || (it.href !== "/" && path.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex flex-col items-center py-1.5 sm:py-2 text-[10px] sm:text-[11px] rounded-2xl min-w-0 ${
                  on ? "bg-navy text-gold font-semibold" : "text-slate-500"
                }`}
              >
                <span className="text-base sm:text-lg leading-none mb-0.5">{it.icon}</span>
                <span className="truncate max-w-full px-0.5">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
