/** Fixed Krishna Residency map — do not rearrange plot numbers. */

export const SOCIETY_LAYOUT = {
  gateLabel: "GATE",
  parkingLabel: "PARKING",
  gardenLabel: "CHILDREN GARDEN",
  /** Gate sits between plot 9 (left) and plot 8 (right). */
  gateBetween: [9, 8] as const,
  /** Parking sits opposite the gate, between plot 36 (left) and plot 37 (right). */
  parkingBetween: [36, 37] as const,
  /** Garden sits at the far end beside plots 23 and 24. */
  gardenBeside: [23, 24] as const,
  rows: [
    {
      id: "row-1",
      center: "gate" as const,
      left: [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
      right: [8, 7, 6, 5, 4, 3, 2, 1],
    },
    {
      id: "row-2",
      center: "parking" as const,
      left: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
      right: [37, 38, 39, 40, 41, 42, 43, 44],
    },
  ],
} as const;

export const ALL_LAYOUT_PLOTS: number[] = SOCIETY_LAYOUT.rows.flatMap((r) => [...r.left, ...r.right]);

export type PayStatus = "paid" | "partial" | "pending" | "vacant";

export const PAY_STATUS_STYLE: Record<PayStatus, { fill: string; edge: string; label: string }> = {
  paid: { fill: "#dcfce7", edge: "#16a34a", label: "Paid" },
  partial: { fill: "#ffedd5", edge: "#ea580c", label: "Partial" },
  pending: { fill: "#fee2e2", edge: "#dc2626", label: "Pending" },
  vacant: { fill: "#e5e7eb", edge: "#6b7280", label: "Vacant" },
};
