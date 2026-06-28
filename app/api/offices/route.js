import { NextResponse } from "next/server";
import { formValue, hashPassword, logActivity, requireApiUser } from "@/lib/api-auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const user = await requireApiUser(request, "CEO");
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const officeName = formValue(formData, "officeName");
  const code = formValue(formData, "code").toUpperCase();
  const managerName = formValue(formData, "managerName");
  const username = formValue(formData, "username");
  const password = formValue(formData, "password");

  if (!officeName || !code || !managerName || !username || password.length < 8) {
    return NextResponse.redirect(new URL("/ceo/offices?error=missing-fields", request.url));
  }

  const officeResult = await query("INSERT INTO offices (name, code) VALUES ($1, $2) RETURNING id", [officeName, code]);
  await query(
    `INSERT INTO users (name, username, password_hash, role, office_id)
     VALUES ($1, $2, $3, 'OFFICE', $4)`,
    [managerName, username, await hashPassword(password), officeResult.rows[0].id]
  );
  await logActivity(user.id, "created office", "office", officeResult.rows[0].id, { officeName });

  return NextResponse.redirect(new URL("/ceo/offices", request.url), { status: 303 });
}
