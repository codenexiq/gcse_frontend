import { apiFetch } from "@/lib/api";
import type { StudentDiagnosticResult, StudentProfile, StudentProfileInput } from "@/types";

// Browser-side calls for the student workflow.
export const saveStudentProfile = (profile: StudentProfileInput) =>
  apiFetch<StudentProfile>("/student/profile", { method: "PUT", body: JSON.stringify(profile) });

/** choice = index of the chosen answer, or -1 for "I haven't learned this yet". */
export const submitStudentDiagnostic = (answers: { questionId: number; choice: number }[]) =>
  apiFetch<StudentDiagnosticResult>("/student/diagnostic/submit", { method: "POST", body: JSON.stringify({ answers }) });
