import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const filter: Record<string, unknown> = {};
  if (type && ["car", "bike", "rickshaw", "auto"].includes(type)) {
    filter.type = type === "rickshaw" ? { $in: ["rickshaw", "auto"] } : type;
  }
  if (q) {
    filter.$or = [
      { number: { $regex: q, $options: "i" } },
      { ownerName: { $regex: q, $options: "i" } },
      { stickerNumber: { $regex: q, $options: "i" } },
    ];
  }
  const vehicles = await Vehicle.find(filter).populate("flatId").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ vehicles });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.flatId || !body.type || !body.number) {
    return NextResponse.json({ error: "પ્લોટ, પ્રકાર અને નંબર જરૂરી છે" }, { status: 400 });
  }
  await dbConnect();
  const vehicle = await Vehicle.create({
    flatId: body.flatId,
    type: body.type === "auto" ? "rickshaw" : body.type,
    number: body.number,
    occupant: body.occupant === "renter" ? "renter" : "owner",
    ownerName: body.ownerName || "",
    stickerIssued: !!body.stickerIssued,
    stickerNumber: body.stickerNumber || "",
  });
  return NextResponse.json({ vehicle });
}
