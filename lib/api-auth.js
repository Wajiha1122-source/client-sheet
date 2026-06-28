import { SignJWT, jwtVerify } from "jose";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export const SESSION_COOKIE = "client_sheet_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET || "development-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function formValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

export async function makeSessionToken(user) {
  return new SignJWT({
    id: user.id,
    role: user.role,
    officeId: user.office_id,
    name: user.name
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function requireApiUser(request, role) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (role && payload.role !== role) return null;

    const { rows } = await query(
      `SELECT users.id, users.name, users.username, users.role, users.office_id, offices.name AS office_name
       FROM users
       LEFT JOIN offices ON offices.id = users.office_id
       WHERE users.id = $1 AND users.is_active = TRUE`,
      [payload.id]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export { hashPassword, verifyPassword };

export async function logActivity(userId, action, entityType, entityId, metadata = {}) {
  await query(
    "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) VALUES ($1, $2, $3, $4, $5)",
    [userId, action, entityType, entityId, metadata]
  );
}
