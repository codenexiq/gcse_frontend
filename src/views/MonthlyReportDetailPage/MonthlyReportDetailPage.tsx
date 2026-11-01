import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getMonthlyReport } from "@/services/monthlyReportService/monthlyReportService.server";
import MonthlyReportDetail from "@/components/tutor/MonthlyReportDetail";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: one student's report.
export default async function MonthlyReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTutor();
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId) || reportId <= 0) notFound();

  try {
    const report = await getMonthlyReport(reportId);
    return <MonthlyReportDetail report={report.data} sentOn={report.updated_at} studentId={report.student_id} studentName={report.full_name || report.email} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this report: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
