"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { formatInr, waUrl } from "@/lib/format";
import { MONTHLY_MAINTENANCE } from "@/lib/constants";

type Purpose = { _id: string; title: string; amountPerFlat: number };
type Flat = { _id: string; number: number; ownerName: string; ownerMobile: string };
type Col = {
  _id: string;
  purposeId: string;
  amount: number;
  mode: string;
  date: string;
  notes: string;
  reference: string;
  flatId?: Flat;
};
type Summary = { purpose: Purpose; expected: number; collected: number; pending: number; pct: number };

export default function CollectionsPage() {
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [purposeId, setPurposeId] = useState("");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [collections, setCollections] = useState<Col[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "pending">("all");
  const [openC, setOpenC] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [editC, setEditC] = useState<string | null>(null);
  const [cForm, setCForm] = useState({
    flatId: "",
    amount: String(MONTHLY_MAINTENANCE),
    mode: "cash",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    reference: "",
  });

  async function load() {
    const p = await api.get<{ purposes: Purpose[] }>("/api/purposes");
    setPurposes(p.purposes);
    const pid = purposeId || p.purposes[0]?._id || "";
    if (!purposeId && pid) setPurposeId(pid);
    const c = await api.get<{ collections: Col[]; summaries: Summary[]; flats: Flat[] }>(
      `/api/collections?year=${year}&month=${month}${pid ? `&purposeId=${pid}` : ""}`
    );
    setCollections(c.collections);
    setSummaries(c.summaries);
    setFlats(c.flats);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [purposeId, year, month]);

  const purpose = purposes.find((x) => x._id === purposeId);
  const summary = summaries.find((s) => s.purpose._id === purposeId);
  const paidIds = new Set(collections.filter((c) => c.flatId).map((c) => (c.flatId as Flat)._id));
  const pendingFlats = flats.filter((f) => !paidIds.has(f._id));

  async function saveCol() {
    const body = { ...cForm, purposeId, amount: Number(cForm.amount), kind: "member" };
    if (editC) await api.put(`/api/collections/${editC}`, body);
    else await api.post("/api/collections", body);
    setOpenC(false);
    setEditC(null);
    await load();
  }

  return (
    <>
      <Header title="કલેક્શન" />
      <Screen>
        <div className="flex flex-wrap gap-2">
          <select className={`${inputCls} min-w-0 flex-1`} value={purposeId} onChange={(e) => setPurposeId(e.target.value)}>
            {purposes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} (₹{p.amountPerFlat})
              </option>
            ))}
          </select>
          <select className={inputCls} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select className={inputCls} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        {summary && (
          <div className="card-surface p-4 grid grid-cols-2 gap-2 text-sm">
            <div>કુલ {formatInr(summary.expected)}</div>
            <div>વસૂલ {formatInr(summary.collected)}</div>
            <div>બાકી {formatInr(summary.pending)}</div>
            <div>{summary.pct}%</div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {(["all", "paid", "pending"] as const).map((x) => (
            <button key={x} onClick={() => setPaidFilter(x)} className={`px-3 py-1 rounded-full text-xs ${paidFilter === x ? "bg-navy text-white" : "bg-white"}`}>
              {x === "all" ? "બધા" : x === "paid" ? "ચૂકવેલ" : "બાકી"}
            </button>
          ))}
          <button
            className="ml-auto bg-gold text-navy rounded-xl px-3 text-xs"
            onClick={() => {
              setEditC(null);
              setCForm({
                flatId: "",
                amount: String(purpose?.amountPerFlat || MONTHLY_MAINTENANCE),
                mode: "cash",
                date: new Date().toISOString().slice(0, 10),
                notes: "",
                reference: "",
              });
              setOpenC(true);
            }}
          >
            + કલેક્શન
          </button>
        </div>

        {paidFilter !== "paid" &&
          pendingFlats.map((f) => (
            <article key={f._id} className="card-surface p-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">ઘર નંબર {f.number}</p>
                <p className="text-xs text-red-600">બાકી {formatInr(purpose?.amountPerFlat || MONTHLY_MAINTENANCE)}</p>
              </div>
              {f.ownerMobile && (
                <a
                  className="text-xs bg-green-600 text-white rounded-full px-3 py-1"
                  href={waUrl(f.ownerMobile, `નમસ્તે,\nKrishna Residency ઘર નંબર ${f.number} — મેન્ટેનન્સ ₹${purpose?.amountPerFlat} બાકી છે.`)}
                  target="_blank"
                >
                  WhatsApp
                </a>
              )}
            </article>
          ))}

        {paidFilter !== "pending" &&
          collections.map((c) => (
            <article key={c._id} className="card-surface p-3">
              <div className="flex justify-between">
                <p className="font-semibold">
                  ઘર નંબર {(c.flatId as Flat)?.number ?? ""} · {formatInr(c.amount)}
                </p>
                <span className="text-xs">{c.mode}</span>
              </div>
              <div className="flex gap-3 text-xs mt-1">
                <button
                  onClick={() => {
                    setEditC(c._id);
                    setCForm({
                      flatId: (c.flatId as Flat)?._id || "",
                      amount: String(c.amount),
                      mode: c.mode,
                      date: c.date.slice(0, 10),
                      notes: c.notes,
                      reference: c.reference,
                    });
                    setOpenC(true);
                  }}
                >
                  એડિટ
                </button>
                <button className="text-red-600" onClick={() => setDel(c._id)}>
                  ડિલીટ
                </button>
              </div>
            </article>
          ))}
      </Screen>

      <Modal open={openC} title="કલેક્શન" onClose={() => setOpenC(false)}>
        <Field label="ઘર નંબર (1–44)">
          <select className={inputCls} value={cForm.flatId} onChange={(e) => setCForm({ ...cForm, flatId: e.target.value })}>
            <option value="">પસંદ કરો</option>
            {flats.map((f) => (
              <option key={f._id} value={f._id}>
                ઘર નંબર {f.number}
              </option>
            ))}
          </select>
        </Field>
        <Field label="રકમ">
          <input className={inputCls} type="number" value={cForm.amount} onChange={(e) => setCForm({ ...cForm, amount: e.target.value })} />
        </Field>
        <Field label="મોડ">
          <select className={inputCls} value={cForm.mode} onChange={(e) => setCForm({ ...cForm, mode: e.target.value })}>
            <option value="cash">કેશ</option>
            <option value="bank">બેંક</option>
            <option value="upi">UPI</option>
            <option value="cheque">ચેક</option>
          </select>
        </Field>
        <Field label="તારીખ">
          <input className={inputCls} type="date" value={cForm.date} onChange={(e) => setCForm({ ...cForm, date: e.target.value })} />
        </Field>
        <Field label="નોંધ">
          <input className={inputCls} value={cForm.notes} onChange={(e) => setCForm({ ...cForm, notes: e.target.value })} />
        </Field>
        <button onClick={saveCol} className="btn-primary">
          સેવ
        </button>
      </Modal>
      <Confirm
        open={!!del}
        message="કલેક્શન ડિલીટ?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/collections/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
