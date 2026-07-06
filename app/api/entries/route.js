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

  const businessName = formValue(formData, "businessName");
  const cityArea = formValue(formData, "cityArea");
  const phoneWhatsapp = formValue(formData, "phoneWhatsapp");
  const interestedIn = formValue(formData, "interestedIn");
  const leadQuality = formValue(formData, "leadQuality");

  await query(
    `INSERT INTO client_entries
     (
       month_id, office_id, entry_date, client_name, address, contact, query, result,
       id_number, city_area, business_name, phone_whatsapp, consumer_type, interested_in,
       lead_quality, timeline, market, experience, knowledge_baseline, handled_by,
       visit_date_time, visitor_no, forwarded_by, notes, created_by, updated_by
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13, $14,
       $15, $16, $17, $18, $19, $20,
       NULLIF($21, '')::timestamptz, $22, $23, $24, $25, $25
     )`,
    [
      monthId,
      month.office_id,
      formValue(formData, "entryDate"),
      businessName,
      cityArea,
      phoneWhatsapp,
      interestedIn,
      leadQuality,
      formValue(formData, "idNumber"),
      cityArea,
      businessName,
      phoneWhatsapp,
      formValue(formData, "consumerType"),
      interestedIn,
      leadQuality,
      formValue(formData, "timeline"),
      formValue(formData, "market"),
      formValue(formData, "experience"),
      formValue(formData, "knowledgeBaseline"),
      formValue(formData, "handledBy"),
      formValue(formData, "visitDateTime"),
      formValue(formData, "visitorNo"),
      formValue(formData, "forwardedBy"),
      formValue(formData, "notes"),
      user.id
    ]
  );
  await logActivity(user.id, "added client entry", "client_entry", null, { monthId });

  return NextResponse.redirect(new URL(user.role === "CEO" ? "/ceo/clients" : `/office/dashboard?month=${monthId}`, request.url), { status: 303 });
}
