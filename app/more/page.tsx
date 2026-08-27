"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Screen } from "@/components/ui";
import { InstallAppButton } from "@/components/PwaInstall";

const cards = [
  { href: "/notices", title: "નોટિસ", sub: "જાહેરાત બોર્ડ", icon: "✦", tone: "from-amber-50 to-white" },
  { href: "/emergency", title: "ઇમરજન્સી નંબર", sub: "પોલીસ, ફાયર, હોસ્પિટલ", icon: "☎", tone: "from-red-50 to-white" },
  { href: "/events", title: "ઇવેન્ટ", sub: "સોસાયટી કાર્યક્રમ", icon: "◎", tone: "from-sky-50 to-white" },
];

export default function MorePage() {
  return (
    <>
      <Header title="વધુ" />
      <Screen>
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className={`card-surface p-4 min-h-[140px] bg-gradient-to-br ${c.tone} flex flex-col justify-between`}>
              <span className="text-2xl">{c.icon}</span>
              <div>
                <h2 className="font-guj font-bold">{c.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="card-surface p-4 bg-gradient-to-br from-navy to-[#1a4a73] text-white">
          <p className="font-guj font-bold">મોબાઈલ પર એપ ઇન્સ્ટોલ</p>
          <p className="text-xs text-white/70 mt-1 mb-3">હોમ સ્ક્રીન પર આયકન ઉમેરો — વાઈ-ફાઈ વગર પણ ખોલી શકાય.</p>
          <InstallAppButton variant="block" />
        </div>
      </Screen>
    </>
  );
}
