import { requireStudent } from "@/lib/session";
import { getChatConversations, getChatGroups } from "@/services/chatService/chatService.server";
import ChatInbox from "@/components/dashboard/ChatInbox";
import Alert from "@/components/ui/Alert";

// A student's chats: a separate chat with each tutor or admin.
export default async function StudentMessagesPage() {
  const user = await requireStudent();
  try {
    const [conversations, groups] = await Promise.all([getChatConversations(), getChatGroups()]);
    return <ChatInbox initial={conversations} initialGroups={groups} meId={user.id} noun="tutor" canManageGroups={false} initialChatColor={user.chatColor ?? null} />;
  } catch (err) {
    return <Alert>Could not load your messages: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
