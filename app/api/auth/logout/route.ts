import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res, req);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
