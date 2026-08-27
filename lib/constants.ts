export const SOCIETY_NAME = "Krishna Residency";
export const APP_NAME = "Krishna Residency Management System";
export const TOTAL_GALAS = 44;
export const MONTHLY_MAINTENANCE = 400;
export const AUTH_COOKIE = "kr_admin_token";

export const PAYMENT_MODES = ["cash", "bank", "upi", "cheque"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const VEHICLE_TYPES = ["car", "bike", "auto"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];
