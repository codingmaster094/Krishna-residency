import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Notice } from "@/models/Notice";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const q = new URL(req.url).searchParams.get("q") || "";
  const filter = q ? { $or: [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }] } : {};
  const notices = await Notice.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ notices });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  if (!body.title || !body.description) {
    return NextResponse.json({ error: "શીર્ષક અને વિગત જરૂરી છે" }, { status: 400 });
  }
  await dbConnect();
  const notice = await Notice.create({ title: body.title, description: body.description });
  return NextResponse.json({ notice });
}
