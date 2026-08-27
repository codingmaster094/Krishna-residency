import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Collection } from "@/models/Collection";
import { PaymentPurpose } from "@/models/PaymentPurpose";
import { Flat } from "@/models/Flat";
import { TOTAL_GALAS } from "@/lib/constants";
import { monthBounds } from "@/lib/format";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const url = new URL(req.url);
  const purposeId = url.searchParams.get("purposeId");
  const year = Number(url.searchParams.get("year") || 0);
  const month = Number(url.searchParams.get("month") || 0);
  const [all, purposes, flats] = await Promise.all([
    Collection.find().populate("flatId").sort({ date: -1 }).lean(),
    PaymentPurpose.find().lean(),
    Flat.find().lean(),
  ]);
  let scoped = all;
  if (year && month) {
    const { start, end } = monthBounds(year, month);
    scoped = all.filter((c) => {
      const d = new Date(c.date);
      return d >= start && d < end;
    });
  }
  const items = purposeId ? scoped.filter((c) => String(c.purposeId) === purposeId) : scoped;

  const summaries = purposes.map((p) => {
    const relevant = scoped.filter((c) => String(c.purposeId) === String(p._id));
    const expected = p.amountPerFlat * TOTAL_GALAS;
    const collected = relevant.reduce((s, c) => s + c.amount, 0);
    const pending = Math.max(0, expected - collected);
    const pct = expected ? Math.round((collected / expected) * 100) : 0;
    return { purpose: p, expected, collected, pending, pct, eligibleCount: TOTAL_GALAS };
  });

  return NextResponse.json({ collections: items, summaries, flats });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.purposeId || !body.amount || !body.mode || !body.date || !body.flatId) {
    return NextResponse.json({ error: "જરૂરી ફીલ્ડ ખૂટે છે" }, { status: 400 });
  }
  await dbConnect();
  const col = await Collection.create({
    purposeId: body.purposeId,
    flatId: body.flatId,
    kind: "member",
    amount: Number(body.amount),
    mode: body.mode,
    date: new Date(body.date),
    notes: body.notes || "",
    reference: body.reference || "",
  });
  return NextResponse.json({ collection: col });
}
