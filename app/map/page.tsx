"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Field, Modal, Screen, inputCls } from "@/components/ui";
import { api } from "@/lib/api";
import { formatInr, formatPhoneDisplay } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { PAY_STATUS_STYLE, SOCIETY_LAYOUT, type PayStatus } from "@/lib/society-layout";

export type LayoutPlot = {
  _id: string;
  number: number;
  status: string;
  ownerName: string;
  ownerMobile: string;
  renterName: string;
  renterMobile: string;
  expected: number;
  paid: number;
  due: number;
  vehicleCount: number;
  payStatus: PayStatus;
};

function HomeIcon({ color }: { color: string }) {
  return (
    <svg className="iso-home" viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M12 3.2 3.5 10.2h2.2V20h5.1v-5.2h2.4V20h5.1V10.2h2.2L12 3.2Z"
      />
    </svg>
  );
}

function GateScene() {
  return (
    <svg className="scene" viewBox="0 0 80 78" aria-hidden>
      <rect x="6" y="18" width="12" height="52" rx="2" fill="#78716c" />
      <rect x="62" y="18" width="12" height="52" rx="2" fill="#78716c" />
      <rect x="4" y="14" width="16" height="8" rx="1" fill="#a8a29e" />
      <rect x="60" y="14" width="16" height="8" rx="1" fill="#a8a29e" />
      <path d="M18 28 C18 8 62 8 62 28" fill="none" stroke="#b45309" strokeWidth="6" />
      <rect x="20" y="30" width="40" height="38" fill="#7f1d1d" />
      <g stroke="#fbbf24" strokeWidth="2.2">
        <line x1="28" y1="34" x2="28" y2="64" />
        <line x1="36" y1="34" x2="36" y2="64" />
        <line x1="44" y1="34" x2="44" y2="64" />
        <line x1="52" y1="34" x2="52" y2="64" />
        <line x1="22" y1="46" x2="58" y2="46" />
      </g>
      <circle cx="40" cy="46" r="3.2" fill="#fbbf24" />
    </svg>
  );
}

function ParkingScene() {
  return (
    <svg className="scene" viewBox="0 0 80 78" aria-hidden>
      <rect x="4" y="10" width="72" height="58" rx="4" fill="#334155" />
      <g stroke="#facc15" strokeWidth="1.6" strokeDasharray="4 3">
        <line x1="22" y1="16" x2="22" y2="62" />
        <line x1="40" y1="16" x2="40" y2="62" />
        <line x1="58" y1="16" x2="58" y2="62" />
      </g>
      <rect x="8" y="28" width="12" height="20" rx="2" fill="#ef4444" />
      <rect x="9" y="24" width="10" height="6" rx="1" fill="#7f1d1d" />
      <circle cx="11" cy="49" r="2.2" fill="#111" />
      <circle cx="17" cy="49" r="2.2" fill="#111" />
      <rect x="44" y="30" width="12" height="20" rx="2" fill="#38bdf8" />
      <rect x="45" y="26" width="10" height="6" rx="1" fill="#0369a1" />
      <circle cx="47" cy="51" r="2.2" fill="#111" />
      <circle cx="53" cy="51" r="2.2" fill="#111" />
      <circle cx="68" cy="20" r="8" fill="#1d4ed8" stroke="#facc15" strokeWidth="1.5" />
      <text x="68" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#facc15">
        P
      </text>
    </svg>
  );
}

function KidsGardenScene() {
  return (
    <svg className="scene" viewBox="0 0 90 120" aria-hidden>
      <ellipse cx="45" cy="108" rx="38" ry="8" fill="#15803d" />
      <circle cx="18" cy="48" r="14" fill="#22c55e" />
      <rect x="16" y="48" width="5" height="28" fill="#854d0e" />
      <circle cx="72" cy="42" r="16" fill="#16a34a" />
      <rect x="70" y="44" width="5" height="32" fill="#854d0e" />
      <polygon points="22,92 22,62 50,92" fill="#fb7185" />
      <rect x="20" y="90" width="32" height="5" rx="1" fill="#be123c" />
      <line x1="58" y1="58" x2="58" y2="96" stroke="#a16207" strokeWidth="3" />
      <line x1="74" y1="58" x2="74" y2="96" stroke="#a16207" strokeWidth="3" />
      <line x1="58" y1="58" x2="74" y2="58" stroke="#a16207" strokeWidth="3" />
      <rect x="61" y="72" width="10" height="8" rx="1" fill="#f97316" />
      <line x1="66" y1="58" x2="66" y2="72" stroke="#78716c" strokeWidth="1.4" />
      <circle cx="28" cy="102" r="3" fill="#facc15" />
      <circle cx="40" cy="100" r="3" fill="#f472b6" />
      <circle cx="54" cy="103" r="3" fill="#38bdf8" />
      <circle cx="36" cy="28" r="7" fill="#fde047" />
    </svg>
  );
}

const PlotBlock = memo(function PlotBlock({
  plot,
  highlight,
  dim,
  onClick,
}: {
  plot: LayoutPlot;
  highlight: boolean;
  dim: boolean;
  onClick: (p: LayoutPlot) => void;
}) {
  const st = PAY_STATUS_STYLE[plot.payStatus];
  return (
    <button
      type="button"
      className={`iso-plot ${highlight ? "hl" : ""} ${dim ? "opacity-25" : ""}`}
      style={{
        background: `linear-gradient(180deg, #fff 18%, ${st.fill} 100%)`,
        borderColor: st.edge,
        color: st.edge,
      }}
      onClick={() => onClick(plot)}
      aria-label={`Plot ${plot.number}`}
    >
      <HomeIcon color={st.edge} />
      <span className="leading-none text-navy">{plot.number}</span>
    </button>
  );
});

function PlotStrip({
  nums,
  byNum,
  highlight,
  filter,
  onClick,
}: {
  nums: readonly number[];
  byNum: Map<number, LayoutPlot>;
  highlight: number | null;
  filter: PayStatus | "all";
  onClick: (p: LayoutPlot) => void;
}) {
  return (
    <div className="iso-plots">
      {nums.map((n) => {
        const p = byNum.get(n);
        if (!p) return null;
        return (
          <PlotBlock
            key={n}
            plot={p}
            highlight={highlight === n}
            dim={filter !== "all" && p.payStatus !== filter}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
}

function FitMap({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    const apply = () => {
      const naturalW = i.offsetWidth;
      const naturalH = i.offsetHeight;
      if (!naturalW) return;
      const next = o.clientWidth / naturalW;
      setScale(next);
      setHeight(Math.ceil(naturalH * next));
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="iso-fit">
      <div
        ref={inner}
        className="iso-stage"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
      <div aria-hidden className="iso-fit-spacer" style={{ height }} />
    </div>
  );
}

function SocietyMap({
  byNum,
  highlight,
  filter,
  onClick,
}: {
  byNum: Map<number, LayoutPlot>;
  highlight: number | null;
  filter: PayStatus | "all";
  onClick: (p: LayoutPlot) => void;
}) {
  const [row1, row2] = SOCIETY_LAYOUT.rows;
  return (
    <div className="iso-map">
      <div className="iso-landmark iso-garden area-garden" title="Children garden beside plot 23 and 24">
        <KidsGardenScene />
        {SOCIETY_LAYOUT.gardenLabel}
      </div>
      <div className="area-left1">
        <PlotStrip nums={row1.left} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} />
      </div>
      <div className="iso-landmark iso-gate area-mid1" title="Society gate between plot 9 and 8">
        <GateScene />
        {SOCIETY_LAYOUT.gateLabel}
      </div>
      <div className="area-right1">
        <PlotStrip nums={row1.right} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} />
      </div>
      <div className="area-left2">
        <PlotStrip nums={row2.left} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} />
      </div>
      <div className="iso-landmark iso-parking area-mid2" title="Parking opposite the gate">
        <ParkingScene />
        {SOCIETY_LAYOUT.parkingLabel}
      </div>
      <div className="area-right2">
        <PlotStrip nums={row2.right} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} />
      </div>
    </div>
  );
}

export default function SocietyLayoutPage() {
  const { admin } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [plots, setPlots] = useState<LayoutPlot[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PayStatus | "all">("all");
  const [picked, setPicked] = useState<LayoutPlot | null>(null);
  const [form, setForm] = useState({
    status: "sold",
    ownerName: "",
    ownerMobile: "",
    renterName: "",
    renterMobile: "",
  });

  async function load() {
    const d = await api.get<{ plots: LayoutPlot[] }>(`/api/layout?year=${year}&month=${month}`);
    setPlots(d.plots);
  }
  useEffect(() => {
    load().catch(console.error);
  }, [year, month]);

  const byNum = useMemo(() => new Map(plots.map((p) => [p.number, p])), [plots]);

  const highlight = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    const n = Number(s);
    if (Number.isFinite(n) && byNum.has(n)) return n;
    const hit = plots.find(
      (p) => p.ownerName.toLowerCase().includes(s) || p.renterName.toLowerCase().includes(s)
    );
    return hit?.number ?? null;
  }, [q, plots, byNum]);

  function openPlot(p: LayoutPlot) {
    setPicked(p);
    setForm({
      status: p.status,
      ownerName: p.ownerName,
      ownerMobile: p.ownerMobile,
      renterName: p.renterName,
      renterMobile: p.renterMobile,
    });
  }

  async function savePlot() {
    if (!picked?._id || !admin) return;
    await api.put(`/api/flats/${picked._id}`, form);
    setPicked(null);
    await load();
  }

  const statusLabel: Record<string, string> = {
    sold: "Occupied",
    rent: "Rent",
    available: "Vacant",
  };

  return (
    <>
      <Header title="લેઆઉટ" />
      <Screen className="!max-w-none !px-2 sm:!px-4">
        <div className="card-surface p-3 space-y-2">
          <input
            className={inputCls}
            placeholder="પ્લોટ નંબર / હોલ્ડર / રેન્ટર શોધો"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "paid", "partial", "pending", "vacant"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "bg-navy text-white" : "bg-cream"}`}
              >
                {f === "all" ? "All" : PAY_STATUS_STYLE[f].label}
              </button>
            ))}
            <select className={`${inputCls} !py-1.5 w-16 ml-auto`} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select className={`${inputCls} !py-1.5 w-20`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] flex flex-wrap gap-3 text-slate-600">
          <span>🟢 Paid</span>
          <span>🟡 Partial</span>
          <span>🔴 Pending</span>
          <span>⚪ Vacant</span>
          <span>🚪 Gate</span>
          <span>🅿️ Parking</span>
          <span>🛝 Children Garden</span>
        </div>

        <FitMap>
          <SocietyMap byNum={byNum} highlight={highlight} filter={filter} onClick={openPlot} />
        </FitMap>
      </Screen>

      <Modal open={!!picked} title={picked ? `Plot ${picked.number}` : ""} onClose={() => setPicked(null)}>
        {picked && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Plot Holder: </span>
              <b className="font-guj">{picked.ownerName || "—"}</b>
            </p>
            <p>
              <span className="text-slate-500">Mobile: </span>
              {picked.ownerMobile ? formatPhoneDisplay(picked.ownerMobile) : "—"}
            </p>
            <p>
              <span className="text-slate-500">Status: </span>
              {statusLabel[picked.status] || picked.status} · {PAY_STATUS_STYLE[picked.payStatus].label}
            </p>
            {picked.status === "rent" && (
              <p>
                <span className="text-slate-500">Renter: </span>
                {picked.renterName || "—"} {picked.renterMobile ? `· ${formatPhoneDisplay(picked.renterMobile)}` : ""}
              </p>
            )}
            <p>
              <span className="text-slate-500">Maintenance Due: </span>
              <b>{formatInr(picked.due)}</b>
              <span className="text-slate-400"> (paid {formatInr(picked.paid)} / {formatInr(picked.expected)})</span>
            </p>
            <p>
              <span className="text-slate-500">Vehicles: </span>
              {picked.vehicleCount}
            </p>

            {admin && picked._id && (
              <div className="pt-3 border-t mt-3">
                <p className="font-guj font-bold mb-2">Admin · પ્લોટ માહિતી</p>
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="sold">Occupied / Holder</option>
                    <option value="rent">Rent</option>
                    <option value="available">Vacant</option>
                  </select>
                </Field>
                <Field label="Plot Holder">
                  <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                </Field>
                <Field label="Mobile">
                  <input className={inputCls} value={form.ownerMobile} onChange={(e) => setForm({ ...form, ownerMobile: e.target.value })} />
                </Field>
                {form.status === "rent" && (
                  <>
                    <Field label="Renter">
                      <input className={inputCls} value={form.renterName} onChange={(e) => setForm({ ...form, renterName: e.target.value })} />
                    </Field>
                    <Field label="Renter mobile">
                      <input className={inputCls} value={form.renterMobile} onChange={(e) => setForm({ ...form, renterMobile: e.target.value })} />
                    </Field>
                  </>
                )}
                <button type="button" className="btn-primary" onClick={savePlot}>
                  સેવ
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
