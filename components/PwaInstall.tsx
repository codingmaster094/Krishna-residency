"use client";

import { useCallback, useEffect, useState } from "react";

type BeforeInstall = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstall | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone));
    if (standalone) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstall);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferred(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) {
      setIosHint(true);
      return;
    }
    setIosHint(true);
  }, [deferred]);

  return { canInstall: !installed, installed, install, iosHint, closeHint: () => setIosHint(false) };
}

export function InstallAppButton({ variant = "header" }: { variant?: "header" | "block" | "login" }) {
  const { canInstall, install, iosHint, closeHint } = usePwaInstall();
  if (!canInstall) return null;

  const label = "એપ ઇન્સ્ટોલ";

  return (
    <>
      {variant === "header" && (
        <button
          type="button"
          onClick={install}
          className="text-[11px] whitespace-nowrap bg-gold text-navy font-semibold rounded-full px-3 py-1.5"
        >
          {label}
        </button>
      )}
      {variant === "login" && (
        <button type="button" onClick={install} className="mt-3 w-full rounded-2xl py-3 font-guj font-semibold bg-gold text-navy">
          ⬇ {label} — મોબાઈલ પર ઉમેરો
        </button>
      )}
      {variant === "block" && (
        <button type="button" onClick={install} className="w-full rounded-2xl py-3 font-guj font-semibold bg-gold text-navy">
          ⬇ {label}
        </button>
      )}
      {iosHint && (
        <div className="fixed inset-0 z-[60] bg-navy/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-guj font-bold text-navy text-lg">એપ ઇન્સ્ટોલ કરો</h3>
            <ol className="mt-3 text-sm text-slate-600 space-y-2 font-guj list-decimal pl-4">
              <li>બ્રાઉઝરની Share / મેનુ બટન દબાવો</li>
              <li>
                <b>Add to Home Screen</b> / <b>હોમ સ્ક્રીન પર ઉમેરો</b> પસંદ કરો
              </li>
              <li>Add દબાવો — હોમ સ્ક્રીન પર KR આયકન આવશે</li>
            </ol>
            <p className="text-xs text-slate-400 mt-3">Chrome/Edge પર Install prompt આપમેળે આવે. iPhone પર Safari વાપરો.</p>
            <button type="button" onClick={closeHint} className="btn-primary mt-4">
              ઠીક છે
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
