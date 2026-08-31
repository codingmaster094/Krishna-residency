"use client";

import { memo } from "react";
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

const PlotCell = memo(function PlotCell({
  plot,
  highlight,
  dim,
  onClick,
  compact,
}: {
  plot: LayoutPlot;
  highlight: boolean;
  dim: boolean;
  onClick?: (p: LayoutPlot) => void;
  compact?: boolean;
}) {
  const st = PAY_STATUS_STYLE[plot.payStatus];
  return (
    <button
      type="button"
      className={`map-plot ${highlight ? "hl" : ""} ${dim ? "dim" : ""} ${compact ? "compact" : ""}`}
      style={{ background: st.fill, borderColor: st.edge }}
      onClick={() => onClick?.(plot)}
      aria-label={`Plot ${plot.number}`}
    >
      {plot.number}
    </button>
  );
});

function PlotStrip({
  nums,
  byNum,
  highlight,
  filter,
  onClick,
  compact,
}: {
  nums: readonly number[];
  byNum: Map<number, LayoutPlot>;
  highlight: number | null;
  filter: PayStatus | "all";
  onClick?: (p: LayoutPlot) => void;
  compact?: boolean;
}) {
  return (
    <div className="map-plots">
      {nums.map((n) => {
        const p = byNum.get(n);
        if (!p) {
          return (
            <span key={n} className={`map-plot ghost ${compact ? "compact" : ""}`}>
              {n}
            </span>
          );
        }
        return (
          <PlotCell
            key={n}
            plot={p}
            highlight={highlight === n}
            dim={filter !== "all" && p.payStatus !== filter}
            onClick={onClick}
            compact={compact}
          />
        );
      })}
    </div>
  );
}

export function SocietyMap({
  byNum,
  highlight = null,
  filter = "all",
  onClick,
  compact = false,
}: {
  byNum: Map<number, LayoutPlot>;
  highlight?: number | null;
  filter?: PayStatus | "all";
  onClick?: (p: LayoutPlot) => void;
  compact?: boolean;
}) {
  const [row1, row2] = SOCIETY_LAYOUT.rows;
  return (
    <div className={`map-stage ${compact ? "compact" : ""}`}>
      <div className="map-grid">
        <div className="map-spot garden area-garden" title="Children garden">
          <span className="map-emoji">🛝</span>
          <span className="map-spot-label">{compact ? "GARDEN" : SOCIETY_LAYOUT.gardenLabel}</span>
        </div>

        <div className="area-left1">
          <PlotStrip nums={row1.left} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} compact={compact} />
        </div>
        <div className="map-spot gate area-mid1" title="Gate between 9 and 8">
          <span className="map-emoji">🚪</span>
          <span className="map-spot-label">{SOCIETY_LAYOUT.gateLabel}</span>
        </div>
        <div className="area-right1">
          <PlotStrip nums={row1.right} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} compact={compact} />
        </div>

        <div className="area-left2">
          <PlotStrip nums={row2.left} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} compact={compact} />
        </div>
        <div className="map-spot parking area-mid2" title="Parking opposite gate">
          <span className="map-emoji">🅿️</span>
          <span className="map-spot-label">{SOCIETY_LAYOUT.parkingLabel}</span>
        </div>
        <div className="area-right2">
          <PlotStrip nums={row2.right} byNum={byNum} highlight={highlight} filter={filter} onClick={onClick} compact={compact} />
        </div>
      </div>
    </div>
  );
}
