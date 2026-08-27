"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";

type E = { _id: string; title: string; description: string; date: string; place: string };

export default function EventsPage() {
  const [items, setItems] = useState<E[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().slice(0, 10), place: "" });

  async function load() {
    const d = await api.get<{ events: E[] }>("/api/events");
    setItems(d.events);
  }
  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function save() {
    if (edit) await api.put(`/api/events/${edit}`, form);
    else await api.post("/api/events", form);
    setOpen(false);
    setEdit(null);
    await load();
  }

  return (
    <>
      <Header title="ઇવેન્ટ" />
      <Screen>
        <button
          className="mb-3 bg-navy text-white rounded-xl px-3 py-2 text-sm"
          onClick={() => {
            setEdit(null);
            setForm({ title: "", description: "", date: new Date().toISOString().slice(0, 10), place: "" });
            setOpen(true);
          }}
        >
          + ઇવેન્ટ ઉમેરો
        </button>
        {!items.length && <p className="font-guj text-center text-slate-500 py-10">હજુ કોઈ ઇવેન્ટ નથી</p>}
        {items.map((n) => (
          <article key={n._id} className="card-surface p-4 mb-3">
            <h3 className="font-guj font-semibold">{n.title}</h3>
            <p className="text-xs text-slate-500">{n.date.slice(0, 10)} {n.place ? `· ${n.place}` : ""}</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{n.description}</p>
            <div className="flex gap-3 text-xs mt-2">
              <button
                onClick={() => {
                  setEdit(n._id);
                  setForm({ title: n.title, description: n.description, date: n.date.slice(0, 10), place: n.place });
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
      <Modal open={open} title="ઇવેન્ટ" onClose={() => setOpen(false)}>
        <Field label="શીર્ષક">
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="તારીખ">
          <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="સ્થળ">
          <input className={inputCls} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
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
        message="ઇવેન્ટ ડિલીટ?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/events/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
