import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getMyMonthlyReport } from "@/services/monthlyReportService/monthlyReportService.server";
import StudentMonthlyReportView from "@/components/student/StudentMonthlyReportView";
import Alert from "@/components/ui/Alert";

// One report, read-only. The back-end only returns reports that belong to the signed-in student.
export default async function StudentMonthlyReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudent();
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId) || reportId <= 0) notFound();

  try {
    const report = await getMyMonthlyReport(reportId);
    return <StudentMonthlyReportView report={report.data} sentOn={report.updated_at} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this report: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
