import { NextResponse } from "next/server";
import { formValue, logActivity, requireApiUser } from "@/lib/api-auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const user = await requireApiUser(request);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const officeId = user.role === "CEO" ? formValue(formData, "officeId") : user.office_id;
  const monthKey = formValue(formData, "monthKey");
  const notes = formValue(formData, "notes");

  if (!officeId || !monthKey) {
    return NextResponse.redirect(new URL(user.role === "CEO" ? "/ceo/months" : "/office/dashboard", request.url));
  }

  const title = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${monthKey}-01T00:00:00`));
  const result = await query(
    `INSERT INTO entry_months (office_id, month_key, title, notes, created_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (office_id, month_key)
     DO UPDATE SET notes = COALESCE(EXCLUDED.notes, entry_months.notes)
     RETURNING id`,
    [officeId, monthKey, title, notes || null, user.id]
  );
  await logActivity(user.id, "created month", "entry_month", result.rows[0].id, { monthKey, officeId });

  return NextResponse.redirect(new URL(user.role === "CEO" ? "/ceo/months" : "/office/dashboard", request.url), { status: 303 });
}
