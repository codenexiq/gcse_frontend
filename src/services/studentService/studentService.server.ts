import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { DiagnosticIntroContent, StartupOption, StudentProfile, StudentDiagnosticResult, StudentQuestion } from "@/types";

// Server-side reads for the student workflow (Server Components forward the session cookie).
export const getStudentOptions = () => serverFetch<StartupOption[]>("/student/startup-options");
export const getStudentContent = () => serverFetch<DiagnosticIntroContent>("/student/startup-content");
export const getStudentProfile = () => serverFetch<StudentProfile | null>("/student/profile");
export const getStudentDiagnostic = () => serverFetch<StudentQuestion[]>("/student/diagnostic");
export const getStudentResult = () => serverFetch<StudentDiagnosticResult | null>("/student/diagnostic/result");
