import { apiFetch } from "@/lib/api";
import type { LessonBlock, LessonStrand, LessonOutcome, TutorLesson } from "@/types";

// Browser-side calls for building lessons (tutors) and playing them (students).
export const lessonOverview = () => apiFetch<LessonStrand[]>("/lessons/summary");
export const lessonsForTopic = (topic: string) => apiFetch<TutorLesson[]>(`/lessons?topic=${encodeURIComponent(topic)}`);
export const createLesson = (topic: string, title: string) => apiFetch<TutorLesson>("/lessons", { method: "POST", body: JSON.stringify({ topic, title }) });
export const saveLesson = (id: number, body: { title: string; published: boolean; blocks: LessonBlock[] }) => apiFetch<TutorLesson>(`/lessons/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteLesson = (id: number) => apiFetch<{ deleted: boolean }>(`/lessons/${id}`, { method: "DELETE" });

export const checkAnswer = (lessonId: number, blockId: string, choice: number) =>
  apiFetch<{ correct: boolean; correctIndex: number; explain: string }>(`/lessons/student/${lessonId}/check`, { method: "POST", body: JSON.stringify({ blockId, choice }) });
// The AI helper. Each call answers 503 (an ApiError) until the server has an AI key, so the screens can fall back.
export const aiMark = (lessonId: number, blockId: string, answer: string) =>
  apiFetch<{ marks: number; feedback: string }>(`/lessons/student/${lessonId}/mark`, { method: "POST", body: JSON.stringify({ blockId, answer }) });
export const askGenie = (lessonId: number, blockId: string, question: string, answered: boolean) =>
  apiFetch<{ answer: string }>(`/lessons/student/${lessonId}/genie`, { method: "POST", body: JSON.stringify({ blockId, question, answered }) });
/** Makes a fresh practice set on a topic and returns its id. */
export const startPractice = (topic: string) => apiFetch<{ id: number }>("/lessons/student/practice", { method: "POST", body: JSON.stringify({ topic }) });
export const checkPracticeAnswer = (setId: number, blockId: string, choice: number) =>
  apiFetch<{ correct: boolean; correctIndex: number; explain: string }>(`/lessons/student/practice/${setId}/check`, { method: "POST", body: JSON.stringify({ blockId, choice }) });
export const finishPractice = (setId: number, body: { answers: Record<string, number>; written: Record<string, number>; minutes: number }) =>
  apiFetch<LessonOutcome>(`/lessons/student/practice/${setId}/finish`, { method: "POST", body: JSON.stringify(body) });

/** A tutor's PowerPoint text rewritten as lesson blocks. */
export const aiRedesign = (topic: string, slides: string[][]) => apiFetch<{ blocks: LessonBlock[] }>("/lessons/ai/redesign", { method: "POST", body: JSON.stringify({ topic, slides }) });
/** Check questions to go after slides: `after` is the slide number each one follows. */
export const aiQuestions = (topic: string, slides: { title: string; body: string }[]) =>
  apiFetch<{ questions: { after: number; block: LessonBlock }[] }>("/lessons/ai/questions", { method: "POST", body: JSON.stringify({ topic, slides }) });

/** Questions a tutor can reuse in a new quiz (one topic, or every topic when `topic` is empty). */
export interface BankQuestion { topic: string; source: string; block: LessonBlock }
export const questionBank = (topic: string | null) => apiFetch<BankQuestion[]>(`/lessons/bank${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`);
/** A quiz written by AI from the tutor's choices. */
export const aiQuiz = (body: { topic: string; tier: string; n: number; mix: string; focus: string }) => apiFetch<{ blocks: LessonBlock[] }>("/lessons/ai/quiz", { method: "POST", body: JSON.stringify(body) });
/** A PDF (base64) turned into quiz questions or lesson notes. */
export const aiPdf = (body: { topic: string; mode: "quiz" | "notes"; pdf: string }) => apiFetch<{ blocks: LessonBlock[] }>("/lessons/ai/pdf", { method: "POST", body: JSON.stringify(body) });

export const markScheme =(lessonId: number, blockId: string) => apiFetch<{ markScheme: string; marks: number }>(`/lessons/student/${lessonId}/scheme?blockId=${encodeURIComponent(blockId)}`);
export const finishLesson = (lessonId: number, body: { answers: Record<string, number>; written: Record<string, number>; minutes: number }) =>
  apiFetch<LessonOutcome>(`/lessons/student/${lessonId}/finish`, { method: "POST", body: JSON.stringify(body) });
