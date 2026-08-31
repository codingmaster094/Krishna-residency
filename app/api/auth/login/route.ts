import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect, mongoUserMessage } from "@/lib/db";
import { setAuthCookie, signAdminToken } from "@/lib/auth";
import { ensureSocietyData } from "@/lib/ensure-society";
import { findLoginUser } from "@/lib/find-user";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!identifier || !password) {
      return NextResponse.json({ error: "ઈમેઈલ/મોબાઈલ અને પાસવર્ડ જરૂરી છે" }, { status: 400 });
    }

    await dbConnect();
    const admin = await findLoginUser(identifier);
    if (!admin) return NextResponse.json({ error: "ખોટી માહિતી" }, { status: 401 });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: "ખોટી માહિતી" }, { status: 401 });

    try {
      await ensureSocietyData();
    } catch (e) {
      console.error("ensureSocietyData", e);
    }

    const token = await signAdminToken({
      sub: String(admin._id),
      role: "admin",
      email: admin.email,
      name: admin.name,
    });
    const res = NextResponse.json({
      admin: { id: admin._id, name: admin.name, email: admin.email, mobile: admin.mobile },
    });
    setAuthCookie(res, token, req);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    console.error("login", err);
    return NextResponse.json({ error: mongoUserMessage(err) }, { status: 500 });
  }
}
