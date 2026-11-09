import { apiFetch } from "@/lib/api";
import type { SessionGroup, SessionGroupInput } from "@/types";

// Browser-side calls for tutors and admins.
export const createGroup = (input: SessionGroupInput) => apiFetch<SessionGroup>("/tutor/groups", { method: "POST", body: JSON.stringify(input) });
export const updateGroup = (id: number, input: SessionGroupInput) => apiFetch<SessionGroup>(`/tutor/groups/${id}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteGroup = (id: number) => apiFetch<{ deleted: boolean }>(`/tutor/groups/${id}`, { method: "DELETE" });

/** Places a student in a group; they get a chat message with the details. */
export const assignStudentToGroup = (studentId: number, body: { groupId: number; note: string; sendVideo: boolean }) =>
  apiFetch<{ group: SessionGroup }>(`/tutor/students/${studentId}/group`, { method: "PUT", body: JSON.stringify(body) });
export const removeStudentFromGroup = (studentId: number) => apiFetch<{ removed: boolean }>(`/tutor/students/${studentId}/group`, { method: "DELETE" });
