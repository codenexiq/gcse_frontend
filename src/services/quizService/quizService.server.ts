import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { QuizAttempt, QuizForStudent, QuizForTutor, QuizSummary } from "@/types";

// Server-side reads. The back-end decides what the signed-in person may see (a student never gets the answers).
export const getQuizzes = () => serverFetch<QuizSummary[]>("/quizzes");
export const getQuizForTutor = (id: number) => serverFetch<QuizForTutor>(`/quizzes/${id}`);
export const getQuizForStudent = (id: number) => serverFetch<QuizForStudent>(`/quizzes/${id}`);
export const getQuizAttempts = (id: number) => serverFetch<QuizAttempt[]>(`/quizzes/${id}/attempts`);
