import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Flat } from "@/models/Flat";
import { isValidPhone } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  if (body.ownerMobile && !isValidPhone(body.ownerMobile)) {
    return NextResponse.json({ error: "માલિકનો મોબાઈલ 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  if (body.status === "rent" && body.renterMobile && !isValidPhone(body.renterMobile)) {
    return NextResponse.json({ error: "ભાડૂતનો મોબાઈલ 10 અંકનો હોવો જોઈએ" }, { status: 400 });
  }
  await dbConnect();
  const flat = await Flat.findByIdAndUpdate(
    id,
    {
      status: body.status,
      ownerName: body.ownerName ?? "",
      ownerMobile: body.ownerMobile ?? "",
      renterName: body.status === "rent" ? body.renterName ?? "" : "",
      renterMobile: body.status === "rent" ? body.renterMobile ?? "" : "",
    },
    { new: true }
  );
  if (!flat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ flat });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  const flat = await Flat.findByIdAndDelete(id);
  if (!flat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
