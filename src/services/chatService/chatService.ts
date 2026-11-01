import { API_URL } from "@/lib/config";
import { ApiError, apiFetch, errorMessage } from "@/lib/api";
import type { ChatConversation, ChatMessageItem, ChatPointers } from "@/types";

// Browser-side calls for the chat. A student never passes a student id (they always chat in their own conversation).
const q = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) search.set(k, String(v));
  const text = search.toString();
  return text ? `?${text}` : "";
};

export const getConversations = () => apiFetch<ChatConversation[]>("/chat/conversations");

/** after = 0 gives the latest messages; otherwise only the ones newer than that message id. */
export const getMessages = (studentId: number | undefined, after: number) =>
  apiFetch<{ messages: ChatMessageItem[]; pointers: ChatPointers; deletedIds: number[] }>(`/chat/messages${q({ studentId, after })}`);

export const sendMessage = (studentId: number | undefined, body: string, attachmentId?: number) =>
  apiFetch<{ id: number }>("/chat/messages", { method: "POST", body: JSON.stringify({ studentId, body, attachmentId }) });

/** Uploads a file (5 MB at most); the file is sent as the raw request body. */
export async function uploadAttachment(studentId: number | undefined, file: File) {
  const res = await fetch(`${API_URL}/chat/attachments${q({ studentId, name: file.name })}`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/octet-stream", "X-Requested-With": "XMLHttpRequest" },
    body: file,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data as { id: number; name: string; size: number };
}

/** Delete one of your own messages, for everyone. */
export const deleteMessage = (studentId: number | undefined, messageId: number) =>
  apiFetch<{ deleted: boolean }>(`/chat/messages/${messageId}${q({ studentId })}`, { method: "DELETE" });

/** Clear chat: empties the chat on your screen only. */
export const clearChat = (studentId: number | undefined) => apiFetch<{ cleared: boolean }>(`/chat/clear${q({ studentId })}`, { method: "POST" });

/** Delete chat: the whole conversation and its files, for everyone. */
export const deleteChat = (studentId: number | undefined) => apiFetch<{ deleted: boolean }>(`/chat/conversation${q({ studentId })}`, { method: "DELETE" });

export const getUnreadCount = () => apiFetch<{ count: number }>("/chat/unread");

export const attachmentUrl = (id: number) => `${API_URL}/chat/attachments/${id}`;
