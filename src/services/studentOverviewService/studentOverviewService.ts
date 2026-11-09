import { apiFetch } from "@/lib/api";
import type { StudentMonthReport } from "@/types";

// Browser-side call for the report on a student's page. `month` is YYYY-MM.
export const getMonthReport = (studentId: number, month: string) => apiFetch<StudentMonthReport>(`/tutor/students/${studentId}/month-report?month=${month}`);
