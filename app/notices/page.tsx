"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";

type N = { _id: string; title: string; description: string; createdAt: string };

export default function NoticesPage() {
  const [items, setItems] = useState<N[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });

  async function load() {
    const d = await api.get<{ notices: N[] }>(`/api/notices?q=${encodeURIComponent(q)}`);
    setItems(d.notices);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [q]);

  async function save() {
    if (edit) await api.put(`/api/notices/${edit}`, form);
    else await api.post("/api/notices", form);
    setOpen(false);
    setEdit(null);
    await load();
  }

  return (
    <>
      <Header title="નોટિસ" />
      <Screen>
        <div className="flex gap-2 mb-3">
          <input className={inputCls} placeholder="શોધો" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="bg-navy text-white rounded-xl px-3" onClick={() => { setEdit(null); setForm({ title: "", description: "" }); setOpen(true); }}>
            +
          </button>
        </div>
        {items.map((n) => (
          <article key={n._id} className="card-surface p-4 mb-3">
            <h3 className="font-guj font-semibold">{n.title}</h3>
            <p className="text-sm mt-1 whitespace-pre-wrap">{n.description}</p>
            <div className="flex gap-3 text-xs mt-2">
              <button
                onClick={() => {
                  setEdit(n._id);
                  setForm({ title: n.title, description: n.description });
                  setOpen(true);
                }}
              >
                એડિટ
              </button>
              <button className="text-red-600" onClick={() => setDel(n._id)}>
                ડિલીટ
              </button>
            </div>
          </article>
        ))}
      </Screen>
      <Modal open={open} title="નોટિસ" onClose={() => setOpen(false)}>
        <Field label="શીર્ષક">
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="વિગત">
          <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <button onClick={save} className="btn-primary">
          સેવ
        </button>
      </Modal>
      <Confirm
        open={!!del}
        message="નોટિસ ડિલીટ?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/notices/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
