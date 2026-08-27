import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { ExpenseCategory } from "@/models/ExpenseCategory";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const category = await ExpenseCategory.findByIdAndUpdate(
    id,
    {
      name: body.name,
      includeInCommonExpense: !!body.includeInCommonExpense,
      commonRole: body.commonRole || "normal",
    },
    { new: true }
  );
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await ExpenseCategory.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
