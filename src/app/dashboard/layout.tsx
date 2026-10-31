import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireStudent } from "@/lib/session";

// Everything under /dashboard needs a logged-in user, and gets the sidebar layout
// instead of the normal header + footer.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireStudent(); // tutor are sent to /tutor/dashboard instead
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
