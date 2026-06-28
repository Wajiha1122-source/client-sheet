import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

const COOKIE_NAME = "client_sheet_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET || "development-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    role: user.role,
    officeId: user.office_id,
    name: user.name
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function requireUser(role) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect(session.role === "CEO" ? "/ceo/dashboard" : "/office/dashboard");

  const { rows } = await query(
    `SELECT users.id, users.name, users.username, users.role, users.office_id, offices.name AS office_name
     FROM users
     LEFT JOIN offices ON offices.id = users.office_id
     WHERE users.id = $1 AND users.is_active = TRUE`,
    [session.id]
  );

  if (!rows[0]) redirect("/login");
  return rows[0];
}
