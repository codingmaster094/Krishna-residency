"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { inputCls, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { formatInr } from "@/lib/format";

type Dash = {
  year: number;
  month: number;
  galas: number;
  maintenancePerGala: number;
  fund: {
    cashInHand: number;
    bankBalance: number;
    totalBalance: number;
    vehicles: { car: number; bike: number; auto: number };
  };
  monthMaintenance: { expected: number; collected: number; pending: number };
  monthExpenseTotal: number;
  notices: { _id: string; title: string }[];
  events: { _id: string; title: string; date: string }[];
  recentExpenses: { _id: string; title: string; amount: number }[];
};

export default function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api.get<Dash>(`/api/dashboard?year=${year}&month=${month}`).then(setData).catch(console.error);
  }, [year, month]);

  if (!data) return <p className="p-8 text-center text-slate-500 font-guj">લોડ થઈ રહ્યું છે...</p>;
  const f = data.fund;
  const pct = data.monthMaintenance.expected
    ? Math.min(100, Math.round((data.monthMaintenance.collected / data.monthMaintenance.expected) * 100))
    : 0;

  return (
    <>
      <Header title="ડેશબોર્ડ" />
      <Screen>
        <section className="relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#0a1b30] via-[#123152] to-[#1d5a88] shadow-xl">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
          <p className="text-gold text-xs tracking-wide">કૃષ્ણ રેસિડેન્સી · 44 ગાળા</p>
          <p className="text-3xl font-bold mt-2 tracking-tight">{formatInr(f.totalBalance)}</p>
          <p className="text-xs text-white/70">કુલ સોસાયટી બેલેન્સ</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-white/70">હાથમાં રોકડ</p>
              <p className="text-lg font-semibold">{formatInr(f.cashInHand)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-white/70">બેંક</p>
              <p className="text-lg font-semibold">{formatInr(f.bankBalance)}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 text-[11px]">
            <span className="chip bg-gold/20 text-gold">કાર {f.vehicles.car}</span>
            <span className="chip bg-white/10">બાઈક {f.vehicles.bike}</span>
            <span className="chip bg-white/10">ઓટો {f.vehicles.auto}</span>
          </div>
        </section>

        <section className="card-surface p-5">
          <div className="flex justify-between items-start gap-2 mb-3">
            <div>
              <h2 className="font-guj font-bold">માસિક મેન્ટેનન્સ</h2>
              <p className="text-xs text-slate-500">બોરિંગ મોટર + સ્ટ્રીટ લાઈટ · ₹{data.maintenancePerGala} × 44</p>
            </div>
            <div className="flex gap-1">
              <select className={`${inputCls} !py-1.5 !px-2 w-[4.2rem]`} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select className={`${inputCls} !py-1.5 !px-2 w-[5.2rem]`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-2 rounded-full bg-cream overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-gold to-amber-400" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-cream/80 p-2">
              <p className="text-[10px] text-slate-500">કુલ</p>
              <p className="text-sm font-semibold">{formatInr(data.monthMaintenance.expected)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-2">
              <p className="text-[10px] text-emerald-700">વસૂલ</p>
              <p className="text-sm font-semibold text-emerald-800">{formatInr(data.monthMaintenance.collected)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-2">
              <p className="text-[10px] text-red-600">બાકી</p>
              <p className="text-sm font-semibold text-red-700">{formatInr(data.monthMaintenance.pending)}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">આ મહિનાનો ખર્ચ: <b>{formatInr(data.monthExpenseTotal)}</b></p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/notices" className="card-surface p-4">
            <p className="text-gold text-lg">✦</p>
            <h3 className="font-guj font-bold mt-1">નોટિસ</h3>
            {data.notices[0] ? <p className="text-xs text-slate-500 mt-2 line-clamp-2">{data.notices[0].title}</p> : <p className="text-xs text-slate-400 mt-2">નોટિસ નથી</p>}
          </Link>
          <Link href="/events" className="card-surface p-4">
            <p className="text-gold text-lg">◎</p>
            <h3 className="font-guj font-bold mt-1">ઇવેન્ટ</h3>
            {data.events[0] ? <p className="text-xs text-slate-500 mt-2 line-clamp-2">{data.events[0].title}</p> : <p className="text-xs text-slate-400 mt-2">ઇવેન્ટ નથી</p>}
          </Link>
          <Link href="/expenses" className="card-surface p-4 col-span-2">
            <h3 className="font-guj font-bold mb-2">તાજા ખર્ચ</h3>
            {data.recentExpenses.map((e) => (
              <p key={e._id} className="text-sm py-1.5 flex justify-between border-b border-cream last:border-0">
                <span className="font-guj">{e.title}</span>
                <span className="font-semibold">{formatInr(e.amount)}</span>
              </p>
            ))}
            {!data.recentExpenses.length && <p className="text-sm text-slate-400">હજુ ખર્ચ નથી</p>}
          </Link>
        </section>
      </Screen>
    </>
  );
}
