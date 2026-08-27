"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Plot = {
  _id: string;
  number: number;
  status: "sold" | "rent" | "available";
  ownerName: string;
  ownerMobile: string;
  renterName: string;
  renterMobile: string;
};

const labels: Record<Plot["status"], string> = { sold: "માલિક", rent: "ભાડે", available: "ખાલી" };

export default function PlotsPage() {
  const { admin } = useAuth();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Plot | null>(null);
  const [form, setForm] = useState({
    status: "sold" as Plot["status"],
    ownerName: "",
    ownerMobile: "",
    renterName: "",
    renterMobile: "",
  });

  async function load() {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const d = await api.get<{ flats: Plot[] }>(`/api/flats?${p}`);
    setPlots(d.flats);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [q, status]);

  function start(f: Plot) {
    setEdit(f);
    setForm({
      status: f.status,
      ownerName: f.ownerName,
      ownerMobile: f.ownerMobile,
      renterName: f.renterName,
      renterMobile: f.renterMobile,
    });
    setOpen(true);
  }

  async function save() {
    if (!edit) return;
    await api.put(`/api/flats/${edit._id}`, form);
    setOpen(false);
    await load();
  }

  return (
    <>
      <Header title="પ્લોટ 1–44" />
      <Screen>
        <p className="text-sm text-slate-500 font-guj -mt-1">Krishna Residency · કુલ 44 પ્લોટ</p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="પ્લોટ / નામ શોધો" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">બધા</option>
            <option value="sold">માલિક</option>
            <option value="rent">ભાડે</option>
            <option value="available">ખાલી</option>
          </select>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {plots.map((f) => (
            <button
              key={f._id}
              type="button"
              onClick={() => (admin ? start(f) : undefined)}
              className="card-surface p-2 text-left min-h-[88px]"
            >
              <p className="text-lg font-bold text-navy">{f.number}</p>
              <p className="text-[10px] text-gold">{labels[f.status]}</p>
              <p className="text-[10px] font-guj truncate">{f.ownerName || "—"}</p>
            </button>
          ))}
        </div>
        {admin && <p className="text-[11px] text-slate-400">પ્લોટ ટેપ કરીને માલિક / ભાડૂત એડિટ કરો</p>}
      </Screen>
      <Modal open={open} title={edit ? `પ્લોટ ${edit.number}` : "પ્લોટ"} onClose={() => setOpen(false)}>
        <Field label="સ્થિતિ">
          <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Plot["status"] })}>
            <option value="sold">પ્લોટ હોલ્ડર (માલિક)</option>
            <option value="rent">ભાડે (રેન્ટર)</option>
            <option value="available">ખાલી</option>
          </select>
        </Field>
        <Field label="પ્લોટ હોલ્ડર નામ">
          <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        </Field>
        <Field label="હોલ્ડર મોબાઈલ">
          <input className={inputCls} value={form.ownerMobile} onChange={(e) => setForm({ ...form, ownerMobile: e.target.value })} />
        </Field>
        {form.status === "rent" && (
          <>
            <Field label="રેન્ટર નામ">
              <input className={inputCls} value={form.renterName} onChange={(e) => setForm({ ...form, renterName: e.target.value })} />
            </Field>
            <Field label="રેન્ટર મોબાઈલ">
              <input className={inputCls} value={form.renterMobile} onChange={(e) => setForm({ ...form, renterMobile: e.target.value })} />
            </Field>
          </>
        )}
        <button onClick={save} className="btn-primary">
          સેવ
        </button>
      </Modal>
    </>
  );
}
