import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json();
  await dbConnect();
  const event = await Event.findByIdAndUpdate(
    id,
    {
      title: body.title,
      description: body.description || "",
      date: body.date ? new Date(body.date) : undefined,
      place: body.place || "",
    },
    { new: true }
  );
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await dbConnect();
  await Event.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
