import { apiFetch } from "@/lib/api";
import type { MonthlyReport } from "@/lib/monthlyReport";

// Browser-side: a tutor sends the finished report to a student.
export const sendMonthlyReport = (studentId: number, report: MonthlyReport) =>
  apiFetch<{ studentId: number; subject: string; month: string }>("/tutor/monthly-reports", {
    method: "POST",
    body: JSON.stringify({ studentId, subject: report.subject, month: report.month, data: report }),
  });
