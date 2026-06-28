import { query } from "@/lib/db";

export default async function OfficesPage() {
  const offices = await query(
    `SELECT offices.*, users.name AS manager_name, users.username
     FROM offices
     LEFT JOIN users ON users.office_id = offices.id AND users.role = 'OFFICE'
     ORDER BY offices.created_at DESC`
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Offices</h1>
          <p className="subtitle">Create office dashboards and credentials from here.</p>
        </div>
      </div>
      <section className="grid grid-2">
        <form className="card" action="/api/offices" method="post">
          <h2>Create Office</h2>
          <div className="field"><label>Office name</label><input name="officeName" required /></div>
          <div className="field"><label>Office code</label><input name="code" placeholder="LHR-01" required /></div>
          <div className="field"><label>Office user name</label><input name="managerName" required /></div>
          <div className="field"><label>Login username</label><input name="username" required /></div>
          <div className="field"><label>Temporary password</label><input name="password" type="password" minLength={8} required /></div>
          <button className="button" type="submit">Create Office Login</button>
        </form>
        <div className="card">
          <h2>Office List</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Office</th><th>Code</th><th>User</th><th>Username</th></tr></thead>
              <tbody>
                {offices.rows.map((office) => (
                  <tr key={office.id}>
                    <td>{office.name}</td>
                    <td>{office.code}</td>
                    <td>{office.manager_name || "-"}</td>
                    <td>{office.username || "-"}</td>
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
