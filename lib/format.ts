export function formatInr(amount: number) {
  const n = Number(amount) || 0;
  const isWhole = Math.abs(n - Math.round(n)) < 0.0001;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(n);
}

export function digitsOnly(phone: string) {
  return (phone || "").replace(/\D/g, "");
}

export function formatPhoneDisplay(phone: string) {
  const d = digitsOnly(phone);
  if (d.length === 10) return `${d.slice(0, 5)} ${d.slice(5)}`;
  return phone;
}

export function isValidPhone(phone: string) {
  return /^\d{10}$/.test(digitsOnly(phone));
}

export function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function monthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export function waUrl(phone: string, text: string) {
  const d = digitsOnly(phone);
  const num = d.length === 10 ? `91${d}` : d;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
