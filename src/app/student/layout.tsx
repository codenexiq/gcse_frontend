import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StudentSteps from "@/components/student/StudentSteps";
import { requireStudent } from "@/lib/session";

// Everything under /student is the student workflow: About you -> Diagnostic -> Your group -> Learning map.
// Only students can open it (tutors and admins are sent to their own area).
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireStudent();
  return (
    <DashboardShell user={user}>
      <StudentSteps />
      {children}
    </DashboardShell>
  );
}
