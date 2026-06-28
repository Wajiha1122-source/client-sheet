import { NextResponse } from "next/server";
import { formValue, logActivity, requireApiUser } from "@/lib/api-auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const user = await requireApiUser(request);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const monthId = formValue(formData, "monthId");
  const params = user.role === "CEO" ? [monthId] : [monthId, user.office_id];
  const sql = user.role === "CEO" ? "SELECT * FROM entry_months WHERE id = $1" : "SELECT * FROM entry_months WHERE id = $1 AND office_id = $2";
  const monthResult = await query(sql, params);
  const month = monthResult.rows[0];
  if (!month) return NextResponse.redirect(new URL("/office/dashboard", request.url));

  await query(
    `INSERT INTO client_entries
     (month_id, office_id, entry_date, client_name, address, contact, query, result, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
    [
      monthId,
      month.office_id,
      formValue(formData, "entryDate"),
      formValue(formData, "clientName"),
      formValue(formData, "address"),
      formValue(formData, "contact"),
      formValue(formData, "query"),
      formValue(formData, "result"),
      user.id
    ]
  );
  await logActivity(user.id, "added client entry", "client_entry", null, { monthId });

  return NextResponse.redirect(new URL(user.role === "CEO" ? "/ceo/clients" : `/office/dashboard?month=${monthId}`, request.url), { status: 303 });
}
