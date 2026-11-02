import { API_URL } from "@/lib/config";
import { ApiError, apiFetch, errorMessage } from "@/lib/api";
import type { ProfileData } from "@/types";

export type ImageKind = "avatar" | "cover";

/** The address of the signed-in person's picture. The version changes with the picture, so browsers fetch the new one. */
export const profileImageUrl = (kind: ImageKind, version: number) => `${API_URL}/profile/image/${kind}?v=${version}`;

/** Anyone's profile picture, as far as the server allows it (a student sees tutors and admins, staff see students). */
export const userAvatarUrl = (userId: number, version: number) => `${API_URL}/profile/avatar/${userId}?v=${version}`;

/** Anyone's cover photo, as far as the server allows it. */
export const userCoverUrl = (userId: number, version: number) => `${API_URL}/profile/cover/${userId}?v=${version}`;

/** A STUDENT's picture, for tutors and admins (the server only allows that). The version changes with the picture. */
export const studentAvatarUrl = (studentId: number, version: number) => `${API_URL}/profile/avatar/${studentId}?v=${version}`;

/** A STUDENT's cover photo, for tutors and admins. */
export const studentCoverUrl = (studentId: number, version: number) => `${API_URL}/profile/cover/${studentId}?v=${version}`;

export interface ProfileDetails {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  gender: string;
  headline: string;
  location: string;
  bio: string;
}

export const saveProfileDetails = (details: ProfileDetails) => apiFetch<ProfileData>("/profile", { method: "PUT", body: JSON.stringify(details) });

/** Is this @username free for me? (I may keep my own.) */
export const usernameAvailableForMe = (username: string) =>
  apiFetch<{ available: boolean; reason: "invalid" | null }>(`/profile/username-available?username=${encodeURIComponent(username)}`);

/** Saves the colour of the chat area (null = the standard colour). */
export const saveChatColor = (color: string | null) => apiFetch<{ chatColor: string | null }>("/profile/chat-color", { method: "PUT", body: JSON.stringify({ color }) });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<{ changed: boolean }>("/profile/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });

/** Uploads a picture (the file is the request body). */
export async function uploadProfileImage(kind: ImageKind, picture: Blob) {
  const res = await fetch(`${API_URL}/profile/image/${kind}`, {
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

export const removeProfileImage = (kind: ImageKind) => apiFetch<{ removed: boolean }>(`/profile/image/${kind}`, { method: "DELETE" });
