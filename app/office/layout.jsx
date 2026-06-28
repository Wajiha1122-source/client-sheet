import Shell from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export default async function OfficeLayout({ children }) {
  const user = await requireUser("OFFICE");
  return <Shell user={user}>{children}</Shell>;
}
