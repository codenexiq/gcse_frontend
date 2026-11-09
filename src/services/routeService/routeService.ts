import { apiFetch } from "@/lib/api";
import type { LearningRoute } from "@/types";

// Browser-side calls for learning routes (tutors and admins).
export const createRoute = (name: string, description = "") => apiFetch<LearningRoute>("/tutor/routes", { method: "POST", body: JSON.stringify({ name, description }) });
export const saveRoute = (id: number, body: { name: string; description: string; steps: { type: "lesson" | "quiz"; id: number; week: number }[]; assigned: number[] }) =>
  apiFetch<LearningRoute>(`/tutor/routes/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteRoute = (id: number) => apiFetch<{ deleted: boolean }>(`/tutor/routes/${id}`, { method: "DELETE" });
export const assignRoute = (routeId: number, studentId: number) => apiFetch<{ assigned: boolean }>(`/tutor/routes/${routeId}/students/${studentId}`, { method: "PUT" });
