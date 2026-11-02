import { apiFetch } from "@/lib/api";
import type { LessonLogEntry } from "@/types";

/** What the form sends. (The email and the account always come from the sign-in, never from the form.) */
export type LessonLogInput = Omit<LessonLogEntry, "id" | "tutorId" | "tutorEmail" | "createdAt">;

export const createLessonLog = (entry: LessonLogInput) => apiFetch<LessonLogEntry>("/tutor/lesson-logs", { method: "POST", body: JSON.stringify(entry) });

/** Admins only. */
export const deleteLessonLog = (id: number) => apiFetch<{ deleted: boolean }>(`/tutor/lesson-logs/${id}`, { method: "DELETE" });
