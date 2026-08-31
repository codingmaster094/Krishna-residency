import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "./constants";

function secret() {
  const s = process.env.JWT_SECRET || "krishna-residency-dev-jwt-secret-change-in-prod";
  return new TextEncoder().encode(s);
}

export type AdminJwt = { sub: string; role: "admin"; email: string; name: string };

export async function signAdminToken(payload: AdminJwt) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyAdminToken(token: string): Promise<AdminJwt | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || !payload.sub) return null;
    return payload as unknown as AdminJwt;
  } catch {
    return null;
  }
}

export async function getAdminFromCookies(): Promise<AdminJwt | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return { admin: null as AdminJwt | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin, error: null as NextResponse | null };
}

function cookieSecure(req?: Request) {
  if (process.env.NODE_ENV !== "production") return false;
  const proto = req?.headers.get("x-forwarded-proto") || "";
  if (proto) return proto.split(",")[0].trim() === "https";
  return true;
}

export function setAuthCookie(res: NextResponse, token: string, req?: Request) {
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(req),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: NextResponse, req?: Request) {
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(req),
    path: "/",
    maxAge: 0,
  });
}
