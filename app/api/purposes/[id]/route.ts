import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { PaymentPurpose } from "@/models/PaymentPurpose";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const purpose = await PaymentPurpose.findByIdAndUpdate(
    id,
    {
      title: body.title,
      amountPerFlat: Number(body.amountPerFlat),
      description: body.description || "",
      active: body.active !== false,
      scope: body.scope === "all" ? "all" : "sold",
    },
    { new: true }
  );
  if (!purpose) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ purpose });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await PaymentPurpose.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
