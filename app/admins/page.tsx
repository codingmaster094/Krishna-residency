"use client";

import { FormEvent, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Field, Screen, inputCls } from "@/components/ui";
import { api } from "@/lib/api";

type U = { _id: string; name: string; email: string; mobile: string; role: string };

export default function AdminsPage() {
  const [users, setUsers] = useState<U[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await api.get<{ users: U[] }>("/api/auth/register");
    setUsers(d.users);
  }
  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOk("");
    try {
      await api.post("/api/auth/register", { name, email, mobile, password });
      setOk("નવો એડમિન બની ગયો");
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="એડમિન" />
      <Screen>
        <form onSubmit={onSubmit} className="card-surface p-4">
          <h2 className="font-guj font-bold mb-3">નવો એડમિન ઉમેરો</h2>
          <Field label="નામ">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="ઈમેઈલ">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="મોબાઈલ">
            <input className={inputCls} value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          </Field>
          <Field label="પાસવર્ડ">
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
          {ok && <p className="text-emerald-700 text-sm mb-2">{ok}</p>}
          <button disabled={busy} className="btn-primary">
            {busy ? "..." : "એડમિન બનાવો"}
          </button>
        </form>
        <div className="space-y-2">
          {users.map((u) => (
            <article key={u._id} className="card-surface p-4">
              <p className="font-guj font-semibold">{u.name}</p>
              <p className="text-xs text-slate-500">{u.email} · {u.mobile}</p>
            </article>
          ))}
        </div>
      </Screen>
    </>
  );
}
