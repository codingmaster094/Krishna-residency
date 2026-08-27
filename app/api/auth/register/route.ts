import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect, mongoUserMessage } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { getAdminFromCookies } from "@/lib/auth";
import { digitsOnly, isValidPhone } from "@/lib/format";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const mobile = digitsOnly(String(body.mobile || ""));
    const password = String(body.password || "");

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ error: "નામ, ઈમેઈલ, મોબાઈલ અને પાસવર્ડ જરૂરી છે" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "યોગ્ય ઈમેઈલ લખો" }, { status: 400 });
    }
    if (!isValidPhone(mobile)) {
      return NextResponse.json({ error: "મોબાઈલ 10 અંકનો હોવો જોઈએ" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "પાસવર્ડ ઓછામાં ઓછા 6 અક્ષર" }, { status: 400 });
    }

    await dbConnect();
    const count = await Admin.countDocuments();
    const session = await getAdminFromCookies();
    if (count > 0 && !session) {
      return NextResponse.json({ error: "નવો એડમિન બનાવવા પહેલાં Admin લૉગિન કરો" }, { status: 401 });
    }

    const exists = await Admin.findOne({ $or: [{ email }, { mobile }] });
    if (exists) {
      return NextResponse.json({ error: "આ ઈમેઈલ અથવા મોબાઈલ પહેલેથી છે" }, { status: 409 });
    }

    const admin = await Admin.create({
      name,
      email,
      mobile,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });

    return NextResponse.json({
      ok: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, mobile: admin.mobile },
    });
  } catch (err) {
    console.error("register", err);
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      return NextResponse.json({ error: "આ ઈમેઈલ અથવા મોબાઈલ પહેલેથી છે" }, { status: 409 });
    }
    return NextResponse.json({ error: mongoUserMessage(err) }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAdminFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const users = await Admin.find().select("name email mobile role createdAt").sort({ createdAt: 1 }).lean();
  return NextResponse.json({ users });
}
