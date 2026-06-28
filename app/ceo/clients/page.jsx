import { query } from "@/lib/db";

export default async function CeoClientsPage({ searchParams }) {
  const officeId = searchParams?.office || "";
  const monthId = searchParams?.month || "";
  const search = searchParams?.search || "";

  const offices = await query("SELECT id, name FROM offices WHERE is_active = TRUE ORDER BY name");
  const months = await query(
    `SELECT em.id, em.title, o.name AS office_name
     FROM entry_months em
     JOIN offices o ON o.id = em.office_id
     ORDER BY em.month_key DESC, o.name`
  );

  const params = [];
  const where = [];
  if (officeId) {
    params.push(officeId);
    where.push(`ce.office_id = $${params.length}`);
  }
  if (monthId) {
    params.push(monthId);
    where.push(`ce.month_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(ce.client_name ILIKE $${params.length} OR ce.contact ILIKE $${params.length} OR ce.query ILIKE $${params.length} OR ce.result ILIKE $${params.length})`);
  }

  const entries = await query(
    `SELECT ce.*, o.name AS office_name, em.title AS month_title
     FROM client_entries ce
     JOIN offices o ON o.id = ce.office_id
     JOIN entry_months em ON em.id = ce.month_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY ce.entry_date DESC, ce.created_at DESC
     LIMIT 300`,
    params
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Client Entries</h1>
          <p className="subtitle">CEO master view grouped by office and month.</p>
        </div>
      </div>
      <section className="card">
        <form className="toolbar">
          <div className="field">
            <label>Office</label>
            <select name="office" defaultValue={officeId}>
              <option value="">All offices</option>
              {offices.rows.map((office) => <option key={office.id} value={office.id}>{office.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Month</label>
            <select name="month" defaultValue={monthId}>
              <option value="">All months</option>
              {months.rows.map((month) => <option key={month.id} value={month.id}>{month.office_name} - {month.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Search</label>
            <input name="search" defaultValue={search} placeholder="Name, contact, query, result" />
          </div>
          <button className="button" type="submit">Filter</button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Office</th><th>Month</th><th>Name</th><th>Address</th><th>Contact</th><th>Query</th><th>Result</th></tr>
            </thead>
            <tbody>
              {entries.rows.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td>{entry.office_name}</td>
                  <td>{entry.month_title}</td>
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
