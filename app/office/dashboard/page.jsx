import Link from "next/link";
import { BookOpen, CalendarPlus, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export default async function OfficeDashboard({ searchParams }) {
  const user = await requireUser("OFFICE");
  const selectedMonth = searchParams?.month || "";
  const months = await query(
    `SELECT em.*, COUNT(ce.id)::int AS entry_count
     FROM entry_months em
     LEFT JOIN client_entries ce ON ce.month_id = em.id
     WHERE em.office_id = $1
     GROUP BY em.id
     ORDER BY em.month_key DESC`,
    [user.office_id]
  );
  const monthId = selectedMonth || months.rows[0]?.id || "";
  const entries = monthId
    ? await query(
        `SELECT * FROM client_entries
         WHERE office_id = $1 AND month_id = $2
         ORDER BY entry_date DESC, created_at DESC`,
        [user.office_id, monthId]
      )
    : { rows: [] };

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Office Dashboard</h1>
          <p className="subtitle">Add a month first, then record client entries in that month.</p>
        </div>
        <Link className="button light" href="/office/manual"><BookOpen size={18} /> Urdu Manual</Link>
      </div>

      <section className="grid grid-3">
        <div className="card"><div className="label">Office</div><div className="stat" style={{ fontSize: 24 }}>{user.office_name}</div></div>
        <div className="card"><div className="label">Months</div><div className="stat">{months.rows.length}</div></div>
        <div className="card"><div className="label">Selected entries</div><div className="stat">{entries.rows.length}</div></div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <form className="card" action="/api/months" method="post">
          <h2>Add Month</h2>
          <div className="field"><label>Month</label><input name="monthKey" type="month" required /></div>
          <div className="field"><label>Notes</label><textarea name="notes" rows={3} placeholder="Optional office note" /></div>
          <button className="button" type="submit"><CalendarPlus size={18} /> Add Month</button>
        </form>

        <form className="card" action="/api/entries" method="post">
          <h2>Add Client Entry</h2>
          <div className="field">
            <label>Entry month</label>
            <select name="monthId" required defaultValue={monthId}>
              <option value="">Add/select month first</option>
              {months.rows.map((month) => <option key={month.id} value={month.id}>{month.title}</option>)}
            </select>
          </div>
          <div className="field"><label>Date</label><input name="entryDate" type="date" required /></div>
          <div className="field"><label>Name</label><input name="clientName" required /></div>
          <div className="field"><label>Address</label><textarea name="address" rows={2} required /></div>
          <div className="field"><label>Contact</label><input name="contact" required /></div>
          <div className="field"><label>Query</label><textarea name="query" rows={2} required /></div>
          <div className="field"><label>Result</label><textarea name="result" rows={2} required /></div>
          <button className="button" type="submit"><Plus size={18} /> Save Entry</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="topbar">
          <div>
            <h2>Monthly Entries</h2>
            <p className="subtitle">Office users can only see their own office data.</p>
          </div>
          <form>
            <select name="month" defaultValue={monthId} onChange={undefined}>
              {months.rows.map((month) => <option key={month.id} value={month.id}>{month.title} ({month.entry_count})</option>)}
            </select>
            <button className="button secondary" type="submit">Open</button>
          </form>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Name</th><th>Address</th><th>Contact</th><th>Query</th><th>Result</th></tr></thead>
            <tbody>
              {entries.rows.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td>{entry.client_name}</td>
                  <td>{entry.address}</td>
                  <td>{entry.contact}</td>
                  <td>{entry.query}</td>
                  <td>{entry.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
