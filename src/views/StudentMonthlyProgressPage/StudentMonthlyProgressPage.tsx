import { requireStudent } from "@/lib/session";
import { getMyMonthlyReports } from "@/services/monthlyReportService/monthlyReportService.server";
import StudentMonthlyReports from "@/components/student/StudentMonthlyReports";
import Alert from "@/components/ui/Alert";

// The list of monthly progress reports a tutor has sent to this student.
export default async function StudentMonthlyProgressPage() {
  await requireStudent();
  try {
    return <StudentMonthlyReports reports={await getMyMonthlyReports()} />;
  } catch (err) {
    return <Alert>Could not load your reports: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
