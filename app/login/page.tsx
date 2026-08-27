"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME, SOCIETY_NAME } from "@/lib/constants";
import { inputCls } from "@/components/ui";
import { InstallAppButton } from "@/components/PwaInstall";

function AuthForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res =
      mode === "login"
        ? await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
          })
        : await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, mobile, password }),
          });
    const data = await res.json().catch(() => ({ error: "સર્વર જવાબ નથી — MONGODB_URI ચેક કરો" }));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }
    router.replace(next);
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071525] via-[#0f2744] to-[#1c4d7a]" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      <form onSubmit={onSubmit} className="relative card-surface p-5 sm:p-7 w-full max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-navy text-gold font-bold text-xl flex items-center justify-center mb-4 shadow-lg">
          KR
        </div>
        <p className="text-gold text-[11px] tracking-[0.22em] font-semibold">{SOCIETY_NAME.toUpperCase()}</p>
        <h1 className="font-guj text-2xl font-bold text-navy mt-1 leading-snug">{APP_NAME}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">44 ગાળા · માસિક મેન્ટેનન્સ ₹400</p>
        <div className="grid grid-cols-2 gap-1 bg-cream rounded-2xl p-1 mb-5">
          <button type="button" className={`rounded-xl py-2.5 text-sm font-guj ${mode === "login" ? "bg-navy text-white shadow" : "text-slate-600"}`} onClick={() => setMode("login")}>
            લૉગિન
          </button>
          <button type="button" className={`rounded-xl py-2.5 text-sm font-guj ${mode === "register" ? "bg-navy text-white shadow" : "text-slate-600"}`} onClick={() => setMode("register")}>
            એકાઉન્ટ બનાવો
          </button>
        </div>
        {mode === "register" && (
          <>
            <label className="block text-xs mb-3 font-guj">
              નામ
              <input className={`${inputCls} mt-1`} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block text-xs mb-3 font-guj">
              ઈમેઈલ
              <input type="email" className={`${inputCls} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block text-xs mb-3 font-guj">
              મોબાઈલ (10 અંક)
              <input className={`${inputCls} mt-1`} value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </label>
          </>
        )}
        {mode === "login" && (
          <label className="block text-xs mb-3 font-guj">
            ઈમેઈલ અથવા મોબાઈલ
            <input className={`${inputCls} mt-1`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </label>
        )}
        <label className="block text-xs mb-4 font-guj">
          પાસવર્ડ
          <input type="password" className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {err && <p className="text-red-600 text-sm mb-3 font-guj bg-red-50 rounded-xl p-2">{err}</p>}
        <button disabled={busy} className="btn-primary">
          {busy ? "રાહ જુઓ..." : mode === "login" ? "લૉગિન" : "એડમિન એકાઉન્ટ બનાવો"}
        </button>
        <InstallAppButton variant="login" />
      </form>
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
