import Link from "next/link";
import { BookOpen, CalendarPlus, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

const consumerTypes = ["Dealer", "Shop", "Installer", "EPC", "End User", "Farmer", "Corporate", "Industrial", "Commercial"];
const interests = [
  "Hand Bore Drilling",
  "Pump/Motor",
  "Pipeline",
  "Pumping Accessories",
  "Solar Accessories",
  "AC Cable",
  "Solar Panels",
  "Inverter / VFD",
  "Structure",
  "Automation",
  "Valve Fitting",
  "Consultancy",
  "DC Cable"
];
const leadQualities = ["Hot", "Warm", "Cold", "No need to Pursue"];
const timelines = ["Immediate", "1-3 Months", "Later"];
const markets = ["Budget", "Mid", "Premium"];
const experiences = ["Great", "Good", "Average", "+ Contact Me"];
const knowledgeBaselines = [
  "Independent Research",
  "Need Expert Advise",
  "Already Familiar",
  "Market Based Knowledge",
  "Misguided Already"
];

function SelectField({ label, name, options, required = true }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select name={name} required={required} defaultValue="">
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

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

        <form className="card client-form" action="/api/entries" method="post">
          <h2>Add Client Entry</h2>
          <div className="form-section">
            <div className="field">
              <label>Entry month</label>
              <select name="monthId" required defaultValue={monthId}>
                <option value="">Add/select month first</option>
                {months.rows.map((month) => <option key={month.id} value={month.id}>{month.title}</option>)}
              </select>
            </div>
            <div className="field"><label>ID No.</label><input name="idNumber" placeholder="Visitor card ID" /></div>
            <div className="field"><label>Date</label><input name="entryDate" type="date" required /></div>
          </div>

          <div className="form-section">
            <div className="field"><label>City / Area</label><input name="cityArea" required /></div>
            <div className="field"><label>Business Name</label><input name="businessName" required /></div>
            <div className="field"><label>Phone / WhatsApp</label><input name="phoneWhatsapp" required /></div>
          </div>

          <div className="form-section">
            <SelectField label="Consumer Type" name="consumerType" options={consumerTypes} />
            <SelectField label="Interested In" name="interestedIn" options={interests} />
            <SelectField label="Lead Quality" name="leadQuality" options={leadQualities} />
            <SelectField label="Timeline" name="timeline" options={timelines} />
            <SelectField label="Market" name="market" options={markets} />
            <SelectField label="Experience" name="experience" options={experiences} />
            <SelectField label="Knowledge Baseline" name="knowledgeBaseline" options={knowledgeBaselines} />
          </div>

          <h3>For Office Use</h3>
          <div className="form-section">
            <div className="field"><label>Handled By</label><input name="handledBy" /></div>
            <div className="field"><label>Date & Time</label><input name="visitDateTime" type="datetime-local" /></div>
            <div className="field"><label>Visitor No.</label><input name="visitorNo" /></div>
            <div className="field"><label>Forwarded By (If Applicable)</label><input name="forwardedBy" /></div>
          </div>
          <div className="field"><label>Notes</label><textarea name="notes" rows={4} /></div>
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
            <thead><tr><th>Date</th><th>ID</th><th>Business</th><th>City / Area</th><th>Phone</th><th>Type</th><th>Interest</th><th>Lead</th><th>Timeline</th><th>Market</th><th>Notes</th></tr></thead>
            <tbody>
              {entries.rows.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td>{entry.id_number}</td>
                  <td>{entry.business_name || entry.client_name}</td>
                  <td>{entry.city_area || entry.address}</td>
                  <td>{entry.phone_whatsapp || entry.contact}</td>
                  <td>{entry.consumer_type}</td>
                  <td>{entry.interested_in || entry.query}</td>
                  <td>{entry.lead_quality || entry.result}</td>
                  <td>{entry.timeline}</td>
                  <td>{entry.market}</td>
                  <td>{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
