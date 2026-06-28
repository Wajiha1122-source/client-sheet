import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { query } from "@/lib/db";

export default async function CeoDashboard() {
  const [officeCount, monthCount, entryCount, latestEntries] = await Promise.all([
    query("SELECT COUNT(*)::int AS total FROM offices WHERE is_active = TRUE"),
    query("SELECT COUNT(*)::int AS total FROM entry_months"),
    query("SELECT COUNT(*)::int AS total FROM client_entries"),
    query(
      `SELECT ce.entry_date, ce.client_name, ce.contact, ce.query, ce.result, o.name AS office_name, em.title
       FROM client_entries ce
       JOIN offices o ON o.id = ce.office_id
       JOIN entry_months em ON em.id = ce.month_id
       ORDER BY ce.created_at DESC
       LIMIT 8`
    )
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">CEO Dashboard</h1>
          <p className="subtitle">Master view for all offices, months, and client entries.</p>
        </div>
        <Link className="button" href="/ceo/offices">
          <Plus size={18} /> Add Office
        </Link>
      </div>

      <section className="grid grid-3">
        <div className="card"><div className="label">Active offices</div><div className="stat">{officeCount.rows[0].total}</div></div>
        <div className="card"><div className="label">Entry months</div><div className="stat">{monthCount.rows[0].total}</div></div>
        <div className="card"><div className="label">Client entries</div><div className="stat">{entryCount.rows[0].total}</div></div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="topbar">
          <div>
            <h2>Recent Entries</h2>
            <p className="subtitle">Latest records received from offices.</p>
          </div>
          <Link className="button light" href="/ceo/clients">
            <Search size={18} /> View All
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Office</th><th>Month</th><th>Name</th><th>Contact</th><th>Query</th><th>Result</th></tr>
            </thead>
            <tbody>
              {latestEntries.rows.map((entry) => (
                <tr key={`${entry.contact}-${entry.entry_date}`}>
                  <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td>{entry.office_name}</td>
                  <td>{entry.title}</td>
                  <td>{entry.client_name}</td>
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
