"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { inputCls, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";

type Dash = {
  year: number;
  month: number;
  galas: number;
  maintenancePerGala: number;
  fund: {
    cashInHand: number;
    bankBalance: number;
    totalBalance: number;
    vehicles: { car: number; bike: number; rickshaw: number };
  };
  monthMaintenance: { expected: number; collected: number; pending: number };
  monthExpenseTotal: number;
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

  return (
    <>
      <Header title="ડેશબોર્ડ" />
      <Screen>
        <p className="font-guj text-sm text-navy/80 -mt-1">{APP_NAME}</p>

        <section className="relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#0a1b30] via-[#123152] to-[#1d5a88] shadow-xl">
          <p className="text-gold text-xs tracking-wide font-semibold">FUND SUMMARY</p>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-[11px] text-white/70">1. Total Balance</p>
              <p className="text-3xl font-bold tracking-tight">{formatInr(f.totalBalance)}</p>
              <p className="text-xs text-gold mt-1">કુલ બેલેન્સ</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] text-white/70">2. Cash in Hand</p>
                <p className="text-lg font-semibold">{formatInr(f.cashInHand)}</p>
                <p className="text-[10px] text-white/50">હાથમાં રોકડ</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] text-white/70">3. Bank Balance</p>
                <p className="text-lg font-semibold">{formatInr(f.bankBalance)}</p>
                <p className="text-[10px] text-white/50">બેંક બેલેન્સ</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/50 mt-3">કેશ કલેક્શન − કેશ ખર્ચ · બેંક/UPI/ચેક − બેંક ખર્ચ</p>
        </section>

        <section className="card-surface p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-guj font-bold">માસિક મેન્ટેનન્સ</h2>
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
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-2xl bg-cream p-2">
              <p className="text-[10px] text-slate-500">કુલ</p>
              <p className="font-semibold">{formatInr(data.monthMaintenance.expected)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-2">
              <p className="text-[10px] text-emerald-700">વસૂલ</p>
              <p className="font-semibold">{formatInr(data.monthMaintenance.collected)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-2">
              <p className="text-[10px] text-red-600">બાકી</p>
              <p className="font-semibold">{formatInr(data.monthMaintenance.pending)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">આ મહિનાનો ખર્ચ (કલેક્શનમાંથી): {formatInr(data.monthExpenseTotal)}</p>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <Link href="/plots" className="card-surface p-3 text-center">
            <p className="text-xl font-bold">{data.galas}</p>
            <p className="text-[11px] font-guj">પ્લોટ</p>
          </Link>
          <div className="card-surface p-3 text-center">
            <p className="text-xs">કાર {f.vehicles.car}</p>
            <p className="text-xs">બાઈક {f.vehicles.bike}</p>
            <p className="text-xs">રિક્ષા {f.vehicles.rickshaw}</p>
          </div>
          <Link href="/map" className="card-surface p-3 text-center">
            <p className="font-guj text-sm font-bold">લેઆઉટ</p>
            <p className="text-[10px] text-slate-500">GATE · 1–44</p>
          </Link>
        </div>

        <Link href="/expenses" className="card-surface p-4 block">
          <h3 className="font-guj font-bold mb-2">તાજા ખર્ચ</h3>
          {data.recentExpenses.map((e) => (
            <p key={e._id} className="text-sm py-1.5 flex justify-between border-b border-cream last:border-0">
              <span className="font-guj">{e.title}</span>
              <span className="font-semibold">{formatInr(e.amount)}</span>
            </p>
          ))}
          {!data.recentExpenses.length && <p className="text-sm text-slate-400">હજુ ખર્ચ નથી</p>}
        </Link>
      </Screen>
    </>
  );
}
