import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ensureSocietyData } from "@/lib/ensure-society";
import { Flat } from "@/models/Flat";
import { Collection } from "@/models/Collection";
import { Vehicle } from "@/models/Vehicle";
import { PaymentPurpose } from "@/models/PaymentPurpose";
import { MONTHLY_MAINTENANCE } from "@/lib/constants";
import { monthBounds } from "@/lib/format";
import { ALL_LAYOUT_PLOTS, type PayStatus } from "@/lib/society-layout";

export async function GET(req: Request) {
  await dbConnect();
  await ensureSocietyData();

  const url = new URL(req.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year") || now.getFullYear());
  const month = Number(url.searchParams.get("month") || now.getMonth() + 1);
  const { start, end } = monthBounds(year, month);

  const [flats, vehicles, purposeDoc] = await Promise.all([
    Flat.find().lean(),
    Vehicle.find().lean(),
    PaymentPurpose.findOne({ title: "માસિક મેન્ટેનન્સ" }).lean<{
      _id: unknown;
      amountPerFlat?: number;
    } | null>(),
  ]);

  const expected = purposeDoc?.amountPerFlat ?? MONTHLY_MAINTENANCE;
  const pays = purposeDoc
    ? await Collection.find({
        purposeId: purposeDoc._id,
        date: { $gte: start, $lt: end },
      }).lean()
    : [];

  const paidByFlat = new Map<string, number>();
  for (const c of pays) {
    if (!c.flatId) continue;
    const id = String(c.flatId);
    paidByFlat.set(id, (paidByFlat.get(id) || 0) + c.amount);
  }

  const vehByFlat = new Map<string, number>();
  for (const v of vehicles) {
    const id = String(v.flatId);
    vehByFlat.set(id, (vehByFlat.get(id) || 0) + 1);
  }

  const byNumber = new Map(flats.map((f) => [f.number, f]));

  const plots = ALL_LAYOUT_PLOTS.map((number) => {
    const f = byNumber.get(number);
    const id = f ? String(f._id) : "";
    const ownerName = f?.ownerName || "";
    const vacant = !f || f.status === "available" || !ownerName.trim();
    const paid = id ? paidByFlat.get(id) || 0 : 0;
    let payStatus: PayStatus = "vacant";
    if (!vacant) {
      if (paid >= expected && expected > 0) payStatus = "paid";
      else if (paid > 0 && paid < expected) payStatus = "partial";
      else payStatus = "pending";
    }
    return {
      _id: id,
      number,
      status: f?.status || "available",
      ownerName,
      ownerMobile: f?.ownerMobile || "",
      renterName: f?.renterName || "",
      renterMobile: f?.renterMobile || "",
      expected,
      paid,
      due: Math.max(0, expected - paid),
      vehicleCount: id ? vehByFlat.get(id) || 0 : 0,
      payStatus,
    };
  });

  return NextResponse.json({ year, month, expected, plots });
}
