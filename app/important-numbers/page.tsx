"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { digitsOnly, formatPhoneDisplay } from "@/lib/format";

type Num = { _id: string; name: string; description: string; phone: string };

export default function ImportantNumbersPage() {
  const [items, setItems] = useState<Num[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", phone: "" });

  async function load() {
    const d = await api.get<{ numbers: Num[] }>("/api/important-numbers");
    setItems(d.numbers);
  }
  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function copy(phone: string, id: string) {
    await navigator.clipboard.writeText(digitsOnly(phone));
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  async function save() {
    if (edit) await api.put(`/api/important-numbers/${edit}`, form);
    else await api.post("/api/important-numbers", form);
    setOpen(false);
    setEdit(null);
    await load();
  }

  return (
    <>
      <Header title="ઇમરજન્સી નંબર" />
      <Screen>
        <p className="text-sm text-slate-500 mb-3">પોલીસ, ફાયર, હોસ્પિટલ, સોસાયટી કોન્ટેક્ટ</p>
        <button className="mb-3 bg-navy text-white rounded-xl px-3 py-2 text-sm" onClick={() => { setEdit(null); setForm({ name: "", description: "", phone: "" }); setOpen(true); }}>
          + ઉમેરો
        </button>
        {!items.length && <p className="font-guj text-center text-slate-500 py-10">હજુ કોઈ નંબર ઉમેરાયો નથી</p>}
        <div className="space-y-3">
          {items.map((n) => (
            <article key={n._id} className="card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-guj font-semibold">{n.name}</h3>
                {n.description && <p className="text-xs text-slate-500">{n.description}</p>}
              </div>
              <div className="flex items-center gap-1 bg-navy rounded-full pl-3 pr-2 py-1.5">
                <a href={`tel:${digitsOnly(n.phone)}`} className="flex items-center gap-2 text-white text-sm">
                  <span className="text-red-400">☎</span>
                  {formatPhoneDisplay(n.phone)}
                </a>
                <button
                  onClick={() => copy(n.phone, n._id)}
                  className="text-white text-xs px-1"
                  title="Copy"
                >
                  {copied === n._id ? "✓" : "⧉"}
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-2 card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="text-left p-2">નામ</th>
                <th className="text-left p-2">ફોન</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n._id} className="border-t">
                  <td className="p-2 font-guj">{n.name}</td>
                  <td className="p-2">{formatPhoneDisplay(n.phone)}</td>
                  <td className="p-2 text-right">
                    <button
                      className="mr-2"
                      onClick={() => {
                        setEdit(n._id);
                        setForm({ name: n.name, description: n.description, phone: n.phone });
                        setOpen(true);
                      }}
                    >
                      એડિટ
                    </button>
                    <button className="text-red-600" onClick={() => setDel(n._id)}>
                      ડિલીટ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Screen>
      <Modal open={open} title="સંપર્ક" onClose={() => setOpen(false)}>
        <Field label="નામ">
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="વિગત">
          <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="ફોન">
          <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <button onClick={save} className="btn-primary">
          સેવ
        </button>
      </Modal>
      <Confirm
        open={!!del}
        message="આ નંબર ડિલીટ કરવો?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/important-numbers/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
