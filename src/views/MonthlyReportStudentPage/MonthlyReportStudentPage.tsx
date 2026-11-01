import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { getAllMonthlyReports } from "@/services/monthlyReportService/monthlyReportService.server";
import MonthlyReportStudent from "@/components/tutor/MonthlyReportStudent";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: every month's report for one student.
export default async function MonthlyReportStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  await requireTutor();
  const { studentId } = await params;
  const id = Number(studentId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let all;
  try {
    all = await getAllMonthlyReports();
  } catch (err) {
    return <Alert>Could not load the reports: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
  const reports = all.filter((r) => r.student_id === id);
  if (reports.length === 0) notFound();
  return <MonthlyReportStudent reports={reports} />;
}
