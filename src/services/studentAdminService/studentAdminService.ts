import { API_URL } from "@/lib/config";
import { ApiError, apiFetch, errorMessage } from "@/lib/api";
import type { StudentProfileData } from "@/types";

// Browser-side calls an admin or tutor uses to manage student profiles.

/** What can be filled in about a student. */
export interface StudentFormFields {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  headline: string;
  location: string;
  bio: string;
  isActive: boolean;
}

export const createStudent = (fields: StudentFormFields & { password: string }) =>
  apiFetch<StudentProfileData>("/tutor/students", { method: "POST", body: JSON.stringify(fields) });

/** newPassword is optional: leave it out to keep the old one. A new one signs the student out everywhere. */
export const updateStudent = (id: number, fields: StudentFormFields & { newPassword?: string }) =>
  apiFetch<StudentProfileData>(`/tutor/students/${id}`, { method: "PUT", body: JSON.stringify(fields) });

/** Is this @username free? exceptId = the student being edited (who may keep their own). */
export const usernameAvailable = (username: string, exceptId?: number) =>
  apiFetch<{ available: boolean; reason: "invalid" | null }>(`/tutor/students/username-available?username=${encodeURIComponent(username)}${exceptId ? `&except=${exceptId}` : ""}`);

/** Sets a student's profile picture or cover photo (the file is the request body). */
export async function uploadStudentImage(studentId: number, kind: "avatar" | "cover", picture: Blob) {
  const res = await fetch(`${API_URL}/tutor/students/${studentId}/image/${kind}`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/octet-stream", "X-Requested-With": "XMLHttpRequest" },
    body: picture,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data as { version: number };
}

export const removeStudentImage = (studentId: number, kind: "avatar" | "cover") =>
  apiFetch<{ removed: boolean }>(`/tutor/students/${studentId}/image/${kind}`, { method: "DELETE" });

// Admins only (deleting removes everything of the student's for good).
export const deleteStudent = (id: number) => apiFetch<{ deleted: boolean }>(`/tutor/students/${id}`, { method: "DELETE" });

/** Does the same thing to several students at once. (Deleting in bulk is for admins only.) */
export const bulkStudents = (ids: number[], action: "activate" | "deactivate" | "delete") =>
  apiFetch<{ changed: number }>("/tutor/students/bulk", { method: "POST", body: JSON.stringify({ ids, action }) });
