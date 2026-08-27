import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { ImportantNumber } from "@/models/ImportantNumber";
import { isValidPhone } from "@/lib/format";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const numbers = await ImportantNumber.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json({ numbers });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.name || !body.phone) {
    return NextResponse.json({ error: "નામ અને નંબર જરૂરી છે" }, { status: 400 });
  }
  if (!isValidPhone(body.phone)) {
    return NextResponse.json({ error: "ફોન 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  await dbConnect();
  const number = await ImportantNumber.create({
    name: body.name,
    description: body.description || "",
    phone: body.phone,
  });
  return NextResponse.json({ number });
}
