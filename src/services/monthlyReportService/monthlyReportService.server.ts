import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { MonthlyReport } from "@/lib/monthlyReport";
import type { MonthlyReportRecord, MonthlyReportRow, MonthlyReportSummary } from "@/types";

// Server-side reads for a student's own reports.
export const getMyMonthlyReports = () => serverFetch<MonthlyReportSummary[]>("/student/monthly-reports");
export const getMyMonthlyReport = (id: number) => serverFetch<MonthlyReportRecord<MonthlyReport>>(`/student/monthly-reports/${id}`);

// Tutors and admins: every report, and one report with its student.
export const getAllMonthlyReports = () => serverFetch<MonthlyReportRow[]>("/tutor/monthly-reports");
export const getMonthlyReport = (id: number) => serverFetch<MonthlyReportRecord<MonthlyReport> & MonthlyReportRow>(`/tutor/monthly-reports/${id}`);
