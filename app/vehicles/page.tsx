"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";

type Flat = { _id: string; number: number; ownerName: string; renterName: string };
type V = {
  _id: string;
  type: string;
  number: string;
  occupant: string;
  ownerName: string;
  stickerIssued: boolean;
  stickerNumber: string;
  flatId?: Flat;
};

const tlab: Record<string, string> = { car: "કાર", bike: "બાઈક/સ્કૂટર", auto: "ઓટો" };

export default function VehiclesPage() {
  const [items, setItems] = useState<V[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState({
    flatId: "",
    type: "car",
    number: "",
    occupant: "owner",
    ownerName: "",
    stickerIssued: false,
    stickerNumber: "",
  });

  async function load() {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    const v = await api.get<{ vehicles: V[] }>(`/api/vehicles?${p}`);
    const f = await api.get<{ flats: Flat[] }>("/api/flats");
    setItems(v.vehicles);
    setFlats(f.flats);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [q, type]);

  async function save() {
    if (edit) await api.put(`/api/vehicles/${edit}`, form);
    else await api.post("/api/vehicles", form);
    setOpen(false);
    setEdit(null);
    await load();
  }

  return (
    <>
      <Header title="વાહન" />
      <Screen>
        <div className="flex gap-2 mb-3">
          <input className={inputCls} placeholder="શોધો" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">બધા</option>
            <option value="car">કાર</option>
            <option value="bike">બાઈક</option>
            <option value="auto">ઓટો</option>
          </select>
          <button className="bg-navy text-white rounded-xl px-3 text-sm" onClick={() => { setEdit(null); setOpen(true); }}>
            +
          </button>
        </div>
        <div className="space-y-3">
          {items.map((v) => (
            <article key={v._id} className="card-surface p-4">
              <p className="font-semibold">
                {tlab[v.type]} · {v.number}
              </p>
              <p className="font-guj text-sm">ઘર નંબર {(v.flatId as Flat)?.number} · {v.ownerName}</p>
              <p className="text-xs">{v.stickerIssued ? `સ્ટિકર ${v.stickerNumber}` : "સ્ટિકર નથી"}</p>
              <div className="flex gap-3 text-xs mt-2">
                <button
                  onClick={() => {
                    setEdit(v._id);
                    setForm({
                      flatId: (v.flatId as Flat)?._id || "",
                      type: v.type,
                      number: v.number,
                      occupant: v.occupant,
                      ownerName: v.ownerName,
                      stickerIssued: v.stickerIssued,
                      stickerNumber: v.stickerNumber,
                    });
                    setOpen(true);
                  }}
                >
                  એડિટ
                </button>
                <button className="text-red-600" onClick={() => setDel(v._id)}>
                  ડિલીટ
                </button>
              </div>
            </article>
          ))}
        </div>
      </Screen>
      <Modal open={open} title="વાહન" onClose={() => setOpen(false)}>
        <Field label="ઘર નંબર">
          <select className={inputCls} value={form.flatId} onChange={(e) => setForm({ ...form, flatId: e.target.value })}>
            <option value="">પસંદ</option>
            {flats.map((f) => (
              <option key={f._id} value={f._id}>
                ઘર નંબર {f.number}
              </option>
            ))}
          </select>
        </Field>
        <Field label="પ્રકાર">
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="car">કાર</option>
            <option value="bike">બાઈક/સ્કૂટર</option>
            <option value="auto">ઓટો</option>
          </select>
        </Field>
        <Field label="નંબર">
          <input className={inputCls} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        </Field>
        <Field label="માલિક/ભાડૂત">
          <select className={inputCls} value={form.occupant} onChange={(e) => setForm({ ...form, occupant: e.target.value })}>
            <option value="owner">માલિક</option>
            <option value="renter">ભાડૂત</option>
          </select>
        </Field>
        <Field label="નામ (ગુજરાતી)">
          <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        </Field>
        <label className="flex gap-2 text-sm mb-3">
          <input type="checkbox" checked={form.stickerIssued} onChange={(e) => setForm({ ...form, stickerIssued: e.target.checked })} />
          સ્ટિકર આપ્યું
        </label>
        <Field label="સ્ટિકર નંબર">
          <input className={inputCls} value={form.stickerNumber} onChange={(e) => setForm({ ...form, stickerNumber: e.target.value })} />
        </Field>
        <button onClick={save} className="btn-primary">
          સેવ
        </button>
      </Modal>
      <Confirm
        open={!!del}
        message="વાહન ડિલીટ?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/vehicles/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
