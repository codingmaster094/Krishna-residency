import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Notice } from "@/models/Notice";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const notice = await Notice.findByIdAndUpdate(
    id,
    { title: body.title, description: body.description },
    { new: true }
  );
  if (!notice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ notice });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await Notice.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
