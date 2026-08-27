import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Flat } from "@/models/Flat";
import { TOTAL_GALAS } from "@/lib/constants";
import { isValidPhone } from "@/lib/format";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "";
  const filter: Record<string, unknown> = {};
  if (status && ["sold", "rent", "available"].includes(status)) filter.status = status;
  if (q) {
    const n = Number(q);
    filter.$or = [
      ...(Number.isFinite(n) ? [{ number: n }] : []),
      { ownerName: { $regex: q, $options: "i" } },
      { renterName: { $regex: q, $options: "i" } },
      { ownerMobile: { $regex: q } },
      { renterMobile: { $regex: q } },
    ];
  }
  const flats = await Flat.find(filter).sort({ number: 1 }).lean();
  return NextResponse.json({ flats });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const number = Number(body.number);
  if (!number || number < 1 || number > TOTAL_GALAS) {
    return NextResponse.json({ error: "ઘર નંબર 1–44 હોવો જોઈએ" }, { status: 400 });
  }
  if (body.ownerMobile && !isValidPhone(body.ownerMobile)) {
    return NextResponse.json({ error: "માલિકનો મોબાઈલ 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  if (body.status === "rent" && body.renterMobile && !isValidPhone(body.renterMobile)) {
    return NextResponse.json({ error: "ભાડૂતનો મોબાઈલ 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  await dbConnect();
  try {
    const flat = await Flat.create({
      number,
      status: body.status || "available",
      ownerName: body.ownerName || "",
      ownerMobile: body.ownerMobile || "",
      renterName: body.status === "rent" ? body.renterName || "" : "",
      renterMobile: body.status === "rent" ? body.renterMobile || "" : "",
    });
    return NextResponse.json({ flat });
  } catch {
    return NextResponse.json({ error: "ફ્લેટ પહેલેથી છે" }, { status: 409 });
  }
}
