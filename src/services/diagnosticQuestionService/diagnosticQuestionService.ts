import { apiFetch } from "@/lib/api";
import type { DiagnosticGenerateInput, DiagnosticQuestion, DiagnosticQuestionInput } from "@/types";

// Browser-side calls for writing diagnostic questions (tutor / admin only).
export const addDiagnosticQuestion = (question: DiagnosticQuestionInput) =>
  apiFetch<DiagnosticQuestion>("/tutor/diagnostic-questions", { method: "POST", body: JSON.stringify(question) });

export const changeDiagnosticQuestion = (id: number, question: DiagnosticQuestionInput) =>
  apiFetch<DiagnosticQuestion>(`/tutor/diagnostic-questions/${id}`, { method: "PUT", body: JSON.stringify(question) });

export const deleteDiagnosticQuestion = (id: number) =>
  apiFetch<null>(`/tutor/diagnostic-questions/${id}`, { method: "DELETE" });

/** The free built-in generator writes the questions and they are saved. */
export const generateDiagnosticQuestions = (input: DiagnosticGenerateInput) =>
  apiFetch<DiagnosticQuestion[]>("/tutor/diagnostic-questions/generate", { method: "POST", body: JSON.stringify(input) });
