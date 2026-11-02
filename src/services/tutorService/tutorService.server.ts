import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { DiagnosticIntroContent, DiagnosticBatch, DiagnosticQuestion, DiagnosticTopic, StartupOption, StudentProfileData, TutorAccount, TutorOverview, StudentSummary } from "@/types";

// Server-side only: these routes need a tutor / admin session, which Server Components forward.
export const getTutorOverview = () => serverFetch<TutorOverview>("/tutor/overview");
export const getStudentProfile = (id: number) => serverFetch<StudentProfileData>(`/tutor/students/${id}`);
export const getStudents = () => serverFetch<StudentSummary[]>("/tutor/students");
export const getTutorAccounts = () => serverFetch<TutorAccount[]>("/tutor/accounts");
export const getStartupOptions = () => serverFetch<StartupOption[]>("/tutor/startup-options");
export const getStartupContent = () => serverFetch<DiagnosticIntroContent>("/tutor/startup-content");
export const getDiagnosticQuestions = () => serverFetch<DiagnosticQuestion[]>("/tutor/diagnostic-questions");
export const getDiagnosticTopics = () => serverFetch<DiagnosticTopic[]>("/tutor/diagnostic-questions/topics");
export const getDiagnosticBatches = () => serverFetch<DiagnosticBatch[]>("/tutor/diagnostic-questions/batches");
