import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { ChatConversation, ChatGroupSummary } from "@/types";

// Server-side read for the tutor's chat list (Server Components forward the session cookie).
export const getChatConversations = () => serverFetch<ChatConversation[]>("/chat/conversations");

// The groups this person can open (admins: all of them; students: the ones they are in; tutors: none).
export const getChatGroups = () => serverFetch<ChatGroupSummary[]>("/chat/groups");
