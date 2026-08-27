import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { ExpenseCategory } from "@/models/ExpenseCategory";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const categories = await ExpenseCategory.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "નામ જરૂરી છે" }, { status: 400 });
  await dbConnect();
  const category = await ExpenseCategory.create({
    name: body.name,
    includeInCommonExpense: !!body.includeInCommonExpense,
    commonRole: ["normal", "common_credit", "common_debit"].includes(body.commonRole)
      ? body.commonRole
      : "normal",
  });
  return NextResponse.json({ category });
}
