import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { DiagnosticIntroContent, DiagnosticBatch, DiagnosticQuestion, DiagnosticTopic, StartupOption, StudentProfileData, TutorAccount, TutorOverview, StudentSummary, StudentReviewData, StudentOverview, TutorLesson, LessonStrand, LearningRoute, RouteLibraryItem, WaitingStudent, SessionGroup } from "@/types";

// Server-side only: these routes need a tutor / admin session, which Server Components forward.
export const getTutorOverview = () => serverFetch<TutorOverview>("/tutor/overview");
export const getStudentProfile = (id: number) => serverFetch<StudentProfileData>(`/tutor/students/${id}`);
export const getWaitingStudents = () => serverFetch<WaitingStudent[]>("/tutor/students/waiting");
export const getStudentReview = (id: number) => serverFetch<StudentReviewData>(`/tutor/students/${id}/diagnostic`);
export const getStudentOverview = (id: number) => serverFetch<StudentOverview>(`/tutor/students/${id}/overview`);
export const getTutorLesson = (id: number) => serverFetch<TutorLesson>(`/lessons/${id}`);
export const getLessonOverview = () => serverFetch<LessonStrand[]>("/lessons/summary");
export const getLessonsForTopic = (topic: string) => serverFetch<TutorLesson[]>(`/lessons?topic=${encodeURIComponent(topic)}`);
export const getRoutes = () => serverFetch<LearningRoute[]>("/tutor/routes");
export const getRouteLibrary = () => serverFetch<RouteLibraryItem[]>("/tutor/routes/library");
export const getGroups = () => serverFetch<SessionGroup[]>("/tutor/groups");
export const getStudents = () => serverFetch<StudentSummary[]>("/tutor/students");
export const getTutorAccounts = () => serverFetch<TutorAccount[]>("/tutor/accounts");
export const getStartupOptions = () => serverFetch<StartupOption[]>("/tutor/startup-options");
export const getStartupContent = () => serverFetch<DiagnosticIntroContent>("/tutor/startup-content");
export const getDiagnosticQuestions = () => serverFetch<DiagnosticQuestion[]>("/tutor/diagnostic-questions");
export const getDiagnosticTopics = () => serverFetch<DiagnosticTopic[]>("/tutor/diagnostic-questions/topics");
export const getDiagnosticBatches = () => serverFetch<DiagnosticBatch[]>("/tutor/diagnostic-questions/batches");
