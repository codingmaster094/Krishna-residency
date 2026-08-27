import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const events = await Event.find().sort({ date: -1 }).lean();
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.title || !body.date) {
    return NextResponse.json({ error: "શીર્ષક અને તારીખ જરૂરી છે" }, { status: 400 });
  }
  await dbConnect();
  const event = await Event.create({
    title: body.title,
    description: body.description || "",
    date: new Date(body.date),
    place: body.place || "",
  });
  return NextResponse.json({ event });
}
