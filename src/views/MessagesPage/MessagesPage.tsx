import { requireTutor } from "@/lib/session";
import { getChatConversations, getChatGroups } from "@/services/chatService/chatService.server";
import ChatInbox from "@/components/dashboard/ChatInbox";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: chat with the students. Each tutor or admin has their own chat with each student.
export default async function MessagesPage() {
  const user = await requireTutor();
  try {
    const [conversations, groups] = await Promise.all([getChatConversations(), getChatGroups()]);
    // Only admins make groups and manage who is in them.
    return <ChatInbox initial={conversations} initialGroups={groups} meId={user.id} noun="student" canManageGroups={user.role === "admin"} initialChatColor={user.chatColor ?? null} />;
  } catch (err) {
    return <Alert>Could not load the messages: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
