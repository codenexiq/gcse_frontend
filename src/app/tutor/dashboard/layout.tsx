import type { ReactNode } from "react";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireTutor } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Everything under /tutor/dashboard is for tutors and admins only.
// (The back-end checks the role again on every request - this just shows the right page.)
export default async function TutorDashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireTutor();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
