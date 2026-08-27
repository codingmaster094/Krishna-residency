import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { ImportantNumber } from "@/models/ImportantNumber";
import { isValidPhone } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  if (body.phone && !isValidPhone(body.phone)) {
    return NextResponse.json({ error: "ફોન 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  await dbConnect();
  const number = await ImportantNumber.findByIdAndUpdate(
    id,
    { name: body.name, description: body.description || "", phone: body.phone },
    { new: true }
  );
  if (!number) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ number });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await ImportantNumber.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
