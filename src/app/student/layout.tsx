import type { ReactNode } from "react";
import FlowScope from "@/components/ui/FlowScope";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StudentSteps from "@/components/student/StudentSteps";
import { requireStudent } from "@/lib/session";
import { getStudentProgress } from "@/services/studentService/studentService.server";
import type { StudentProgress } from "@/types";

// Everything under /student is the student workflow: About you -> Diagnostic -> Your group -> Learning map.
// Only students can open it (tutors and admins are sent to their own area).
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireStudent();
  let progress: StudentProgress | null = null;
  try {
    progress = await getStudentProgress();
  } catch {
    // the bar still shows; the page below reports its own errors
  }
  return (
    <DashboardShell user={user}>
      <FlowScope>
        <StudentSteps progress={progress} />
        {children}
      </FlowScope>
    </DashboardShell>
  );
}
