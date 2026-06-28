import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "CEO") redirect("/ceo/dashboard");
  if (session?.role === "OFFICE") redirect("/office/dashboard");

  return (
    <main className="login-page">
      <section className="card login-card">
        <div className="login-hero">
          <p className="role-pill">Secure client sheet software</p>
          <h1 className="page-title">One system for CEO control and simple office entry.</h1>
          <p className="subtitle" style={{ color: "#d7efeb" }}>
            Offices record entries by month. CEO sees every office, every month, and every client sheet from one master dashboard.
          </p>
        </div>
        <div className="login-form">
          <h2>Login</h2>
          <p className="subtitle">Use your CEO or office credentials.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
