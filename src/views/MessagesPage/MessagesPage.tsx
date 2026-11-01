import { requireTutor } from "@/lib/session";
import { getChatConversations } from "@/services/chatService/chatService.server";
import ChatInbox from "@/components/dashboard/ChatInbox";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: chat with the students. Each tutor or admin has their own chat with each student.
export default async function MessagesPage() {
  const user = await requireTutor();
  try {
    return <ChatInbox initial={await getChatConversations()} meId={user.id} noun="student" />;
  } catch (err) {
    return <Alert>Could not load the messages: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
