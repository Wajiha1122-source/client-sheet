import Shell from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export default async function ViewerLayout({ children }) {
  const user = await requireUser("VIEWER");
  return <Shell user={user}>{children}</Shell>;
}
