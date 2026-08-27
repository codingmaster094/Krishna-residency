import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Admin } from "@/models/Admin";

export async function GET() {
  const session = await getAdminFromCookies();
  if (!session) return NextResponse.json({ admin: null }, { status: 401 });
  await dbConnect();
  const admin = (await Admin.findById(session.sub).lean()) as {
    _id: unknown;
    name: string;
    email: string;
    mobile: string;
    role: string;
  } | null;
  if (!admin) return NextResponse.json({ admin: null }, { status: 401 });
  return NextResponse.json({
    admin: { id: admin._id, name: admin.name, email: admin.email, mobile: admin.mobile, role: admin.role },
  });
}
