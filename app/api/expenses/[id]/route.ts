import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Expense } from "@/models/Expense";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const expense = await Expense.findByIdAndUpdate(
    id,
    {
      categoryId: body.categoryId,
      expenseType: body.expenseType === "common" ? "common" : "general",
      title: body.title,
      amount: Number(body.amount),
      date: body.date ? new Date(body.date) : undefined,
      paymentMethod: body.paymentMethod,
      notes: body.notes || "",
      bills: body.bills,
      whatsappShared: !!body.whatsappShared,
    },
    { new: true }
  );
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ expense });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await Expense.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
