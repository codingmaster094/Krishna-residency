import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ensureSocietyData } from "@/lib/ensure-society";

export async function POST() {
  if (process.env.ALLOW_SEED !== "true" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed disabled" }, { status: 403 });
  }
  await dbConnect();
  await ensureSocietyData();
  return NextResponse.json({ ok: true });
}
