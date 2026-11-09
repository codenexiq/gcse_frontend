import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { DiagnosticIntroContent, StartupOption, StudentProfile, StudentDiagnosticResult, StudentProgress, StudentQuestion, MyGroup, LearningMap, StudentLesson, StudentHome } from "@/types";

// Server-side reads for the student workflow (Server Components forward the session cookie).
export const getStudentProgress = () => serverFetch<StudentProgress>("/student/progress");
export const getMyGroup = () => serverFetch<MyGroup | null>("/student/group");
export const getLearningMap = () => serverFetch<LearningMap>("/student/learning-map");
export const getPracticeSet = (id: number) => serverFetch<StudentLesson>(`/lessons/student/practice/${id}`);
export const getStudentLesson =(id: number) => serverFetch<StudentLesson>(`/lessons/student/${id}`);
export const getStudentHome = () => serverFetch<StudentHome>("/student/home");
export const getStudentOptions = () => serverFetch<StartupOption[]>("/student/startup-options");
export const getStudentContent = () => serverFetch<DiagnosticIntroContent>("/student/startup-content");
export const getStudentProfile = () => serverFetch<StudentProfile | null>("/student/profile");
export const getStudentDiagnostic = () => serverFetch<StudentQuestion[]>("/student/diagnostic");
export const getStudentResult = () => serverFetch<StudentDiagnosticResult | null>("/student/diagnostic/result");
