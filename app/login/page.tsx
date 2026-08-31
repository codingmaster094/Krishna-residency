"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME, SOCIETY_NAME } from "@/lib/constants";
import { inputCls } from "@/components/ui";
import { InstallAppButton } from "@/components/PwaInstall";
import { useAuth } from "@/components/AuthProvider";

function AuthForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const next = useSearchParams().get("next") || "/";
  const [mode, setMode] = useState<"login" | "create">("login");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOk("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json().catch(() => ({ error: "સર્વર જવાબ નથી" }));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }
    await refresh();
    router.replace(next);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOk("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, password }),
    });
    const data = await res.json().catch(() => ({ error: "સર્વર જવાબ નથી" }));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }
    setOk("એડમિન બની ગયો. હવે લૉગિન કરો.");
    setMode("login");
    setIdentifier(email || mobile);
    setPassword("");
    setName("");
    setEmail("");
    setMobile("");
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071525] via-[#0f2744] to-[#1c4d7a]" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative card-surface p-5 sm:p-7 w-full max-w-sm">
        <Link href="/" className="text-xs text-navy/60 font-guj">
          ← ડેશબોર્ડ
        </Link>
        <img
          src="/logo.jpg"
          alt="Krishna Residency 3"
          className="h-16 w-16 rounded-2xl object-cover my-4 shadow-lg border border-gold/30 bg-navy"
        />
        <p className="text-gold text-[11px] tracking-[0.22em] font-semibold">{SOCIETY_NAME.toUpperCase()}</p>
        <h1 className="font-guj text-2xl font-bold text-navy mt-1">
          {mode === "login" ? "Admin લૉગિન" : "નવો એડમિન"}
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-4">{APP_NAME}</p>

        <div className="grid grid-cols-2 gap-1 p-1 mb-4 rounded-2xl bg-cream">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErr("");
              setOk("");
            }}
            className={`rounded-xl py-2 text-sm font-guj font-semibold ${
              mode === "login" ? "bg-navy text-white shadow" : "text-slate-500"
            }`}
          >
            લૉગિન
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setErr("");
              setOk("");
            }}
            className={`rounded-xl py-2 text-sm font-guj font-semibold ${
              mode === "create" ? "bg-navy text-white shadow" : "text-slate-500"
            }`}
          >
            એડમિન બનાવો
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={onLogin}>
            <label className="block text-xs mb-3 font-guj">
              ઈમેઈલ અથવા મોબાઈલ
              <input
                className={`${inputCls} mt-1`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </label>
            <label className="block text-xs mb-4 font-guj">
              પાસવર્ડ
              <input
                type="password"
                className={`${inputCls} mt-1`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {err && <p className="text-red-600 text-sm mb-3 font-guj bg-red-50 rounded-xl p-2">{err}</p>}
            {ok && <p className="text-emerald-700 text-sm mb-3 font-guj bg-emerald-50 rounded-xl p-2">{ok}</p>}
            <button disabled={busy} className="btn-primary">
              {busy ? "રાહ જુઓ..." : "એડમિન લૉગિન"}
            </button>
          </form>
        ) : (
          <form onSubmit={onCreate}>
            <label className="block text-xs mb-3 font-guj">
              નામ
              <input className={`${inputCls} mt-1`} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block text-xs mb-3 font-guj">
              ઈમેઈલ
              <input
                type="email"
                className={`${inputCls} mt-1`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-xs mb-3 font-guj">
              મોબાઈલ
              <input className={`${inputCls} mt-1`} value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </label>
            <label className="block text-xs mb-4 font-guj">
              પાસવર્ડ (ઓછામાં ઓછા 6 અક્ષર)
              <input
                type="password"
                className={`${inputCls} mt-1`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            {err && <p className="text-red-600 text-sm mb-3 font-guj bg-red-50 rounded-xl p-2">{err}</p>}
            {ok && <p className="text-emerald-700 text-sm mb-3 font-guj bg-emerald-50 rounded-xl p-2">{ok}</p>}
            <button disabled={busy} className="btn-primary">
              {busy ? "રાહ જુઓ..." : "એડમિન બનાવો"}
            </button>
            <p className="text-[11px] text-slate-400 mt-3 font-guj text-center">
              પહેલો એડમિન અહીંથી બનાવી શકાય. પછીના એડમિન માટે પહેલાં લૉગિન કરો અથવા More → નવો એડમિન વાપરો.
            </p>
          </form>
        )}

        <InstallAppButton variant="login" />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-navy" />}>
      <AuthForm />
    </Suspense>
  );
}
