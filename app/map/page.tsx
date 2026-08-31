"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Field, Modal, Screen, inputCls } from "@/components/ui";
import { SocietyMap, type LayoutPlot } from "@/components/SocietyMap";
import { api } from "@/lib/api";
import { formatInr, formatPhoneDisplay } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { PAY_STATUS_STYLE, type PayStatus } from "@/lib/society-layout";

export default function SocietyLayoutPage() {
  const { admin } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [plots, setPlots] = useState<LayoutPlot[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PayStatus | "all">("all");
  const [picked, setPicked] = useState<LayoutPlot | null>(null);
  const [form, setForm] = useState({
    status: "sold",
    ownerName: "",
    ownerMobile: "",
    renterName: "",
    renterMobile: "",
  });

  async function load() {
    const d = await api.get<{ plots: LayoutPlot[] }>(`/api/layout?year=${year}&month=${month}`);
    setPlots(d.plots);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [year, month]);

  const byNum = useMemo(() => new Map(plots.map((p) => [p.number, p])), [plots]);

  const highlight = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    const n = Number(s);
    if (Number.isFinite(n) && byNum.has(n)) return n;
    const hit = plots.find(
      (p) => p.ownerName.toLowerCase().includes(s) || p.renterName.toLowerCase().includes(s)
    );
    return hit?.number ?? null;
  }, [q, plots, byNum]);

  function openPlot(p: LayoutPlot) {
    setPicked(p);
    setForm({
      status: p.status,
      ownerName: p.ownerName,
      ownerMobile: p.ownerMobile,
      renterName: p.renterName,
      renterMobile: p.renterMobile,
    });
  }

  async function savePlot() {
    if (!picked?._id || !admin) return;
    await api.put(`/api/flats/${picked._id}`, form);
    setPicked(null);
    await load();
  }

  const statusLabel: Record<string, string> = {
    sold: "Occupied",
    rent: "Rent",
    available: "Vacant",
  };

  return (
    <>
      <Header title="લેઆઉટ" />
      <Screen className="!max-w-none !px-2 sm:!px-4">
        <div className="card-surface p-3 space-y-2">
          <input
            className={inputCls}
            placeholder="પ્લોટ નંબર / હોલ્ડર / રેન્ટર શોધો"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "paid", "partial", "pending", "vacant"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "bg-navy text-white" : "bg-cream"}`}
              >
                {f === "all" ? "All" : PAY_STATUS_STYLE[f].label}
              </button>
            ))}
            <select
              className={`${inputCls} !py-1.5 w-16 ml-auto`}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select className={`${inputCls} !py-1.5 w-20`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
          <span>🟢 Paid</span>
          <span>🟡 Partial</span>
          <span>🔴 Pending</span>
          <span>⚪ Vacant</span>
          <span>🚪 Gate</span>
          <span>🅿️ Parking</span>
          <span>🛝 Garden</span>
        </div>

        <SocietyMap byNum={byNum} highlight={highlight} filter={filter} onClick={openPlot} />
      </Screen>

      <Modal open={!!picked} title={picked ? `Plot ${picked.number}` : ""} onClose={() => setPicked(null)}>
        {picked && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Plot Holder: </span>
              <b className="font-guj">{picked.ownerName || "—"}</b>
            </p>
            <p>
              <span className="text-slate-500">Mobile: </span>
              {picked.ownerMobile ? formatPhoneDisplay(picked.ownerMobile) : "—"}
            </p>
            <p>
              <span className="text-slate-500">Status: </span>
              {statusLabel[picked.status] || picked.status} · {PAY_STATUS_STYLE[picked.payStatus].label}
            </p>
            {picked.status === "rent" && (
              <p>
                <span className="text-slate-500">Renter: </span>
                {picked.renterName || "—"} {picked.renterMobile ? `· ${formatPhoneDisplay(picked.renterMobile)}` : ""}
              </p>
            )}
            <p>
              <span className="text-slate-500">Maintenance Due: </span>
              <b>{formatInr(picked.due)}</b>
              <span className="text-slate-400">
                {" "}
                (paid {formatInr(picked.paid)} / {formatInr(picked.expected)})
              </span>
            </p>
            <p>
              <span className="text-slate-500">Vehicles: </span>
              {picked.vehicleCount}
            </p>

            {admin && picked._id && (
              <div className="pt-3 border-t mt-3">
                <p className="font-guj font-bold mb-2">Admin · પ્લોટ માહિતી</p>
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="sold">Occupied / Holder</option>
                    <option value="rent">Rent</option>
                    <option value="available">Vacant</option>
                  </select>
                </Field>
                <Field label="Plot Holder">
                  <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                </Field>
                <Field label="Mobile">
                  <input className={inputCls} value={form.ownerMobile} onChange={(e) => setForm({ ...form, ownerMobile: e.target.value })} />
                </Field>
                {form.status === "rent" && (
                  <>
                    <Field label="Renter">
                      <input className={inputCls} value={form.renterName} onChange={(e) => setForm({ ...form, renterName: e.target.value })} />
                    </Field>
                    <Field label="Renter mobile">
                      <input className={inputCls} value={form.renterMobile} onChange={(e) => setForm({ ...form, renterMobile: e.target.value })} />
                    </Field>
                  </>
                )}
                <button type="button" className="btn-primary" onClick={savePlot}>
                  સેવ
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
