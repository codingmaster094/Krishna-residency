import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, mongoUserMessage } from "@/lib/db";
import { Admin } from "@/models/Admin";

export async function GET() {
  const uriSet = Boolean(process.env.MONGODB_URI?.trim());
  try {
    await dbConnect();
    const userCount = await Admin.countDocuments();
    return NextResponse.json({
      ok: true,
      mongodbUriSet: uriSet,
      connected: true,
      database: mongoose.connection.name,
      collection: "users",
      userCount,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, mongodbUriSet: uriSet, connected: false, error: mongoUserMessage(err) },
      { status: 500 }
    );
  }
}
