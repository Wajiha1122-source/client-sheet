import { NextResponse } from "next/server";
import { formValue, makeSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/api-auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const formData = await request.formData();
  const username = formValue(formData, "username");
  const password = formValue(formData, "password");

  const { rows } = await query("SELECT * FROM users WHERE username = $1 AND is_active = TRUE", [username]);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({
    redirectTo: user.role === "CEO" ? "/ceo/dashboard" : "/office/dashboard"
  });
  response.cookies.set(SESSION_COOKIE, await makeSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return response;
}
