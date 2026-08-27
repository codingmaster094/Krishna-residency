import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Collection } from "@/models/Collection";
import { Expense } from "@/models/Expense";
import { Vehicle } from "@/models/Vehicle";
import { Notice } from "@/models/Notice";
import { Event } from "@/models/Event";
import { PaymentPurpose } from "@/models/PaymentPurpose";
import { MONTHLY_MAINTENANCE, TOTAL_GALAS } from "@/lib/constants";
import { monthBounds } from "@/lib/format";
import { ensureSocietyData } from "@/lib/ensure-society";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await ensureSocietyData();

  const url = new URL(req.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year") || now.getFullYear());
  const month = Number(url.searchParams.get("month") || now.getMonth() + 1);
  const { start, end } = monthBounds(year, month);

  const [collections, expenses, vehicles, notices, events, purposes] = await Promise.all([
    Collection.find().lean(),
    Expense.find().populate("categoryId").lean(),
    Vehicle.find().lean(),
    Notice.find().sort({ createdAt: -1 }).limit(5).lean(),
    Event.find().sort({ date: -1 }).limit(5).lean(),
    PaymentPurpose.find({ active: true }).lean(),
  ]);

  const cashCol = collections.filter((c) => c.mode === "cash").reduce((s, c) => s + c.amount, 0);
  const bankCol = collections.filter((c) => c.mode !== "cash").reduce((s, c) => s + c.amount, 0);
  const cashExp = expenses.filter((e) => e.paymentMethod === "cash").reduce((s, e) => s + e.amount, 0);
  const bankExp = expenses.filter((e) => e.paymentMethod !== "cash").reduce((s, e) => s + e.amount, 0);

  const monthCols = collections.filter((c) => {
    const d = new Date(c.date);
    return d >= start && d < end;
  });
  const monthCollected = monthCols.reduce((s, c) => s + c.amount, 0);
  const monthExpected = MONTHLY_MAINTENANCE * TOTAL_GALAS;

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d < end;
  });

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return NextResponse.json({
    year,
    month,
    galas: TOTAL_GALAS,
    maintenancePerGala: MONTHLY_MAINTENANCE,
    fund: {
      cashInHand: cashCol - cashExp,
      bankBalance: bankCol - bankExp,
      totalBalance: cashCol - cashExp + (bankCol - bankExp),
      vehicles: {
        car: vehicles.filter((v) => v.type === "car").length,
        bike: vehicles.filter((v) => v.type === "bike").length,
        auto: vehicles.filter((v) => v.type === "auto").length,
      },
    },
    monthMaintenance: {
      expected: monthExpected,
      collected: monthCollected,
      pending: Math.max(0, monthExpected - monthCollected),
    },
    monthExpenseTotal: monthExpenses.reduce((s, e) => s + e.amount, 0),
    purposes,
    notices,
    events,
    recentExpenses,
  });
}
