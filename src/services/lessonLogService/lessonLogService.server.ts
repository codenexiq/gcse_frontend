import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { LessonLogEntry } from "@/types";

// Server-side read of the lesson log (admins get everybody's entries, a tutor only their own).
export const getLessonLogs = () => serverFetch<LessonLogEntry[]>("/tutor/lesson-logs");
