import Shell from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export default async function CeoLayout({ children }) {
  const user = await requireUser("CEO");
  return <Shell user={user}>{children}</Shell>;
}
