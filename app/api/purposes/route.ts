import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { PaymentPurpose } from "@/models/PaymentPurpose";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const purposes = await PaymentPurpose.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ purposes });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.title || body.amountPerFlat == null) {
    return NextResponse.json({ error: "શીર્ષક અને રકમ જરૂરી છે" }, { status: 400 });
  }
  await dbConnect();
  const purpose = await PaymentPurpose.create({
    title: body.title,
    amountPerFlat: Number(body.amountPerFlat),
    description: body.description || "",
    active: body.active !== false,
    scope: body.scope === "all" ? "all" : "sold",
  });
  return NextResponse.json({ purpose });
}
