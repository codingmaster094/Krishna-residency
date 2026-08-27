"use client";

import { FormEvent, ReactNode, useState } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-guj font-bold text-navy text-lg">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-cream text-navy">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="text-xs font-medium text-slate-500 font-guj">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-slate-200/80 px-3.5 py-2.5 text-sm bg-cream/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/50";

export function Confirm({
  open,
  message,
  onYes,
  onNo,
}: {
  open: boolean;
  message: string;
  onYes: () => void;
  onNo: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
        <p className="font-guj mb-5 text-navy">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onNo} className="px-4 py-2.5 rounded-2xl bg-cream text-sm font-medium">
            રદ
          </button>
          <button onClick={onYes} className="px-4 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-medium">
            ડિલીટ
          </button>
        </div>
      </div>
    </div>
  );
}

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`p-3 sm:p-4 max-w-lg mx-auto space-y-4 pb-8 w-full min-w-0 ${className}`}>{children}</main>
  );
}

export function useFormSubmit(fn: (e: FormEvent) => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await fn(e);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return { busy, err, onSubmit, setErr };
}
