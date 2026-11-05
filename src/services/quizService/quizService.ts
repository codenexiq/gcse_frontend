import { apiFetch } from "@/lib/api";
import type { QuizResult, QuizSummary } from "@/types";

/** Tutors and admins: sends a quiz file (already read as JSON). The back-end checks it and says what is wrong if it is not valid. */
export const uploadQuiz = (file: unknown) => apiFetch<QuizSummary>("/quizzes", { method: "POST", body: JSON.stringify(file) });

/** Shows or hides a quiz for students. */
export const setQuizPublished = (id: number, published: boolean) => apiFetch<{ published: boolean }>(`/quizzes/${id}`, { method: "PATCH", body: JSON.stringify({ published }) });

export const deleteQuiz = (id: number) => apiFetch<{ deleted: boolean }>(`/quizzes/${id}`, { method: "DELETE" });

/** Students: hands in the answers ({ question number: chosen letter }). The server does the marking. */
export const submitQuizAttempt = (id: number, answers: Record<number, string>) => apiFetch<QuizResult>(`/quizzes/${id}/attempts`, { method: "POST", body: JSON.stringify({ answers }) });
