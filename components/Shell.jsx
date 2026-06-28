import Link from "next/link";
import { Building2, ClipboardList, Home, LogOut, UserCog, HelpCircle, CalendarPlus } from "lucide-react";

const ceoNav = [
  ["/ceo/dashboard", Home, "Dashboard"],
  ["/ceo/offices", Building2, "Offices"],
  ["/ceo/months", CalendarPlus, "Months"],
  ["/ceo/clients", ClipboardList, "Client Entries"]
];

const officeNav = [
  ["/office/dashboard", Home, "Dashboard"],
  ["/office/manual", HelpCircle, "Urdu Manual"]
];

export default function Shell({ user, children }) {
  const nav = user.role === "CEO" ? ceoNav : officeNav;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Client Sheet</div>
        <span className="role-pill">
          <UserCog size={14} /> {user.role} {user.office_name ? `- ${user.office_name}` : ""}
        </span>
        <nav className="nav">
          {nav.map(([href, Icon, label]) => (
            <Link key={href} href={href}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post">
            <button className="ghost-button" type="submit">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </nav>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}
