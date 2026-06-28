import { CalendarPlus } from "lucide-react";
import { query } from "@/lib/db";

export default async function CeoMonthsPage() {
  const [offices, months] = await Promise.all([
    query("SELECT id, name FROM offices WHERE is_active = TRUE ORDER BY name"),
    query(
      `SELECT em.*, o.name AS office_name, COUNT(ce.id)::int AS entry_count
       FROM entry_months em
       JOIN offices o ON o.id = em.office_id
       LEFT JOIN client_entries ce ON ce.month_id = em.id
       GROUP BY em.id, o.name
       ORDER BY em.month_key DESC, o.name`
    )
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Monthly Sheets</h1>
          <p className="subtitle">Create monthly buckets for any office and review entry volume.</p>
        </div>
      </div>
      <section className="grid grid-2">
        <form className="card" action="/api/months" method="post">
          <h2>Add Month</h2>
          <div className="field">
            <label>Office</label>
            <select name="officeId" required>
              <option value="">Select office</option>
              {offices.rows.map((office) => <option key={office.id} value={office.id}>{office.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Month</label><input name="monthKey" type="month" required /></div>
          <div className="field"><label>Notes</label><textarea name="notes" rows={3} /></div>
          <button className="button" type="submit"><CalendarPlus size={18} /> Add Month</button>
        </form>
        <div className="card">
          <h2>All Monthly Sheets</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Month</th><th>Office</th><th>Entries</th><th>Notes</th></tr></thead>
              <tbody>
                {months.rows.map((month) => (
                  <tr key={month.id}>
                    <td>{month.title}</td>
                    <td>{month.office_name}</td>
                    <td>{month.entry_count}</td>
                    <td>{month.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
