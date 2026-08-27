import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Collection } from "@/models/Collection";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const col = await Collection.findByIdAndUpdate(
    id,
    {
      amount: Number(body.amount),
      mode: body.mode,
      date: body.date ? new Date(body.date) : undefined,
      notes: body.notes || "",
      reference: body.reference || "",
      kind: "member",
      flatId: body.flatId,
    },
    { new: true }
  );
  if (!col) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ collection: col });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await Collection.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
