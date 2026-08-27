import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Expense } from "@/models/Expense";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const expenses = await Expense.find().populate("categoryId").sort({ date: -1 }).lean();
  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.categoryId || !body.title || !body.amount || !body.date || !body.expenseType || !body.paymentMethod) {
    return NextResponse.json({ error: "જરૂરી ફીલ્ડ ખૂટે છે" }, { status: 400 });
  }
  await dbConnect();
  const expense = await Expense.create({
    categoryId: body.categoryId,
    expenseType: body.expenseType === "common" ? "common" : "general",
    title: body.title,
    amount: Number(body.amount),
    date: new Date(body.date),
    paymentMethod: body.paymentMethod,
    notes: body.notes || "",
    bills: body.bills || [],
    whatsappShared: !!body.whatsappShared,
  });
  return NextResponse.json({ expense });
}
