import mongoose from "mongoose";

function uri() {
  const raw = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "") || "";
  if (!raw) throw new Error("MONGODB_URI is not set");
  return raw;
}

function dbNameFromUri(u: string) {
  try {
    const path = u.split("?")[0].split("/").pop() || "";
    return decodeURIComponent(path) || "Krishna-residency";
  } catch {
    return "Krishna-residency";
  }
}

interface Cache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const g = globalThis as typeof globalThis & { mongooseCache?: Cache };
if (!g.mongooseCache) g.mongooseCache = { conn: null, promise: null };

async function unifyToUsersOnly() {
  const db = mongoose.connection.db;
  if (!db) return;
  const users = db.collection("users");
  const names = await db.listCollections({ name: "admins" }).toArray();
  if (!names.length) return;
  const admins = db.collection("admins");
  const old = await admins.find().toArray();
  for (const doc of old) {
    const { _id, ...rest } = doc;
    await users.updateOne(
      { email: rest.email },
      { $setOnInsert: { _id, ...rest } },
      { upsert: true }
    );
  }
  await admins.drop().catch(() => undefined);
}

export async function dbConnect() {
  const cache = g.mongooseCache!;
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  if (!cache.promise) {
    const u = uri();
    cache.promise = mongoose.connect(u, {
      dbName: dbNameFromUri(u),
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
  }

  try {
    cache.conn = await cache.promise;
    await unifyToUsersOnly();
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    cache.conn = null;
    throw err;
  }
}

export function mongoUserMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("MONGODB_URI is not set")) {
    return ".env.local માં MONGODB_URI મૂકો (MongoDB Atlas → Connect → Drivers)";
  }
  if (msg.includes("bad auth") || msg.includes("Authentication failed")) {
    return "Atlas યૂઝરનેમ/પાસવર્ડ ખોટો છે. URIમાં પાસવર્ડના @ # % ને encode કરો.";
  }
  if (msg.includes("ENOTFOUND") || msg.includes("querySrv") || msg.includes("ECONNREFUSED")) {
    return "Atlas ક્લસ્ટર નામ ખોટું છે અથવા ઈન્ટરનેટ/DNS સમસ્યા છે.";
  }
  if (msg.includes("whitelist") || msg.includes("not allowed")) {
    return "Atlas → Network Access માં IP Add: 0.0.0.0/0";
  }
  if (msg.includes("buffering timed out") || msg.includes("Server selection timed out")) {
    return "Atlas સુધી કનેક્ટ ન થયું. Network Access અને MONGODB_URI ચેક કરો.";
  }
  return msg || "Database error";
}
