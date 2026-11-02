import { API_URL } from "@/lib/config";
import { ApiError, apiFetch, errorMessage } from "@/lib/api";
import type { ChatConversation, ChatGroupDetail, ChatGroupSummary, ChatMessageItem, ChatPeer, ChatPointers } from "@/types";

// Browser-side calls for the chat. Every chat is between one student and one tutor/admin: `peerId` is the OTHER person.
const q = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) search.set(k, String(v));
  const text = search.toString();
  return text ? `?${text}` : "";
};

/** What a chat gives back when it is asked for messages. (Groups have no read ticks, so `pointers` is empty there.) */
export interface ChatMessagesResponse {
  messages: ChatMessageItem[];
  pointers: ChatPointers | null;
  deletedIds: number[];
}

export const getConversations = () => apiFetch<ChatConversation[]>("/chat/conversations");

/** Tutors and admins: find students by name or email (at least 2 letters), to start a new chat. */
export const searchStudents = (query: string) => apiFetch<ChatConversation[]>(`/chat/students${q({ q: query })}`);

/** after = 0 gives the latest messages; otherwise only the ones newer than that message id. */
export const getMessages = (peerId: number, after: number) =>
  apiFetch<ChatMessagesResponse>(`/chat/messages${q({ with: peerId, after })}`);

/** replyToId = the message this one answers (it must be in the same chat). */
export const sendMessage = (peerId: number, body: string, attachmentId?: number, replyToId?: number) =>
  apiFetch<{ id: number }>("/chat/messages", { method: "POST", body: JSON.stringify({ peerId, body, attachmentId, replyToId }) });

/** Uploads a file (5 MB at most); the file is sent as the raw request body. */
export async function uploadAttachment(peerId: number, file: File) {
  const res = await fetch(`${API_URL}/chat/attachments${q({ with: peerId, name: file.name })}`, {
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

/** "everyone": your own message goes for both people (only in the first 10 minutes). "me": it only leaves your own view (any message). */
export const deleteMessage = (peerId: number, messageId: number, scope: "me" | "everyone") =>
  apiFetch<{ deleted: boolean }>(`/chat/messages/${messageId}${q({ with: peerId, scope })}`, { method: "DELETE" });

/** Clear chat: empties the chat on your screen only. */
export const clearChat = (peerId: number) => apiFetch<{ cleared: boolean }>(`/chat/clear${q({ with: peerId })}`, { method: "POST" });

/** Delete chat: this chat and its files, for both people. */
export const deleteChat = (peerId: number) => apiFetch<{ deleted: boolean }>(`/chat/conversation${q({ with: peerId })}`, { method: "DELETE" });

/** The other person's card, shown beside the chat. */
export const getChatPeer = (peerId: number) => apiFetch<ChatPeer>(`/chat/peer${q({ with: peerId })}`);

export const getUnreadCount = () => apiFetch<{ count: number }>("/chat/unread");

export const attachmentUrl = (id: number) => `${API_URL}/chat/attachments/${id}`;

// ---------------------------------------------------------------- group chats

export const getChatGroups = () => apiFetch<ChatGroupSummary[]>("/chat/groups");
export const getChatGroup = (id: number) => apiFetch<ChatGroupDetail>(`/chat/groups/${id}`);

/** Admins only. */
export const createChatGroup = (group: { name: string; description: string; studentIds: number[] }) =>
  apiFetch<ChatGroupDetail>("/chat/groups", { method: "POST", body: JSON.stringify(group) });
export const updateChatGroup = (id: number, group: { name: string; description: string }) =>
  apiFetch<ChatGroupDetail>(`/chat/groups/${id}`, { method: "PUT", body: JSON.stringify(group) });
export const addGroupMembers = (id: number, studentIds: number[]) =>
  apiFetch<ChatGroupDetail>(`/chat/groups/${id}/members`, { method: "POST", body: JSON.stringify({ studentIds }) });
export const removeGroupMember = (id: number, userId: number) => apiFetch<ChatGroupDetail>(`/chat/groups/${id}/members/${userId}`, { method: "DELETE" });
export const deleteChatGroup = (id: number) => apiFetch<{ deleted: boolean }>(`/chat/groups/${id}`, { method: "DELETE" });

// ---------------------------------------------------------------- one chat screen for people and for groups

/** What the chat screen needs from a conversation. A one-to-one chat and a group chat each provide it. */
export interface ChatApi {
  getMessages: (after: number) => Promise<ChatMessagesResponse>;
  send: (body: string, attachmentId?: number, replyToId?: number) => Promise<unknown>;
  upload: (file: File) => Promise<{ id: number }>;
  remove: (messageId: number, scope: "me" | "everyone") => Promise<unknown>;
}

/** The chat with one other person. */
export const personApi = (peerId: number): ChatApi => ({
  getMessages: (after) => getMessages(peerId, after),
  send: (body, attachmentId, replyToId) => sendMessage(peerId, body, attachmentId, replyToId),
  upload: (file) => uploadAttachment(peerId, file),
  remove: (messageId, scope) => deleteMessage(peerId, messageId, scope),
});

/** The chat of one group. */
export const groupApi = (groupId: number): ChatApi => ({
  getMessages: (after) => apiFetch<ChatMessagesResponse>(`/chat/groups/${groupId}/messages${q({ after })}`),
  send: (body, attachmentId, replyToId) =>
    apiFetch<{ id: number }>(`/chat/groups/${groupId}/messages`, { method: "POST", body: JSON.stringify({ body, attachmentId, replyToId }) }),
  upload: async (file) => {
    const res = await fetch(`${API_URL}/chat/groups/${groupId}/attachments${q({ name: file.name })}`, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/octet-stream", "X-Requested-With": "XMLHttpRequest" },
      body: file,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
    return data as { id: number };
  },
  remove: (messageId, scope) => apiFetch<{ deleted: boolean }>(`/chat/groups/${groupId}/messages/${messageId}${q({ scope })}`, { method: "DELETE" }),
});
