import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { ChatConversation } from "@/types";

// Server-side read for the tutor's chat list (Server Components forward the session cookie).
export const getChatConversations = () => serverFetch<ChatConversation[]>("/chat/conversations");
