import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/api-auth";
import { query } from "@/lib/db";

// Change this per app. It must match the "app" value sent by the Master Dashboard.
const SSO_APP_NAME = "client-sheet";

// Change this if the local CEO/admin login username is different in this app.
const LOCAL_CEO_USERNAME = "ceo";

// Change this if the post-SSO landing page changes.
const SSO_REDIRECT_PATH = "/ceo/dashboard";

const MASTER_USER_EMAIL = "chmfj@live.com";
const REQUIRED_MASTER_ROLE = "ceo";

function ssoSecretKey() {
  // Set SSO_SECRET in the environment to the same value used by the Master Dashboard.
  const secret = process.env.SSO_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

function rejectSso(request) {
  return NextResponse.redirect(new URL("/login?error=sso", request.url), { status: 303 });
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return rejectSso(request);

  const secret = ssoSecretKey();
  if (!secret) return rejectSso(request);

  let payload;
  try {
    ({ payload } = await jwtVerify(token, secret));
  } catch {
    return rejectSso(request);
  }

  if (
    payload.masterUser !== MASTER_USER_EMAIL ||
    payload.role !== REQUIRED_MASTER_ROLE ||
    payload.app !== SSO_APP_NAME ||
    typeof payload.exp !== "number"
  ) {
    return rejectSso(request);
  }

  const { rows } = await query(
    "SELECT * FROM users WHERE username = $1 AND role = 'CEO' AND is_active = TRUE",
    [LOCAL_CEO_USERNAME]
  );
  const user = rows[0];
  if (!user) return rejectSso(request);

  const response = NextResponse.redirect(new URL(SSO_REDIRECT_PATH, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, await makeSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
