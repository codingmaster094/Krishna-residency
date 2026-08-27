export const SOCIETY_NAME = "Krishna Residency";
export const APP_NAME = "Krishna Residency Maintenance Manage System";
export const TOTAL_PLOTS = 44;
export const TOTAL_GALAS = TOTAL_PLOTS;
export const MONTHLY_MAINTENANCE = 400;
export const AUTH_COOKIE = "kr_admin_token";

export const PAYMENT_MODES = ["cash", "bank", "upi", "cheque"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const VEHICLE_TYPES = ["car", "bike", "rickshaw", "auto"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const COLLECTION_KINDS = [
  { title: "માસિક મેન્ટેનન્સ", amount: MONTHLY_MAINTENANCE, description: "દર મહિને પ્લોટ મેન્ટેનન્સ" },
  { title: "ઇવેન્ટ કલેક્શન", amount: 0, description: "ઇવેન્ટ માટે કલેક્શન" },
  { title: "ઇમરજન્સી કલેક્શન", amount: 0, description: "ઇમરજન્સી કલેક્શન" },
] as const;
