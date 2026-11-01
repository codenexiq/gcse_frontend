import { requireStudent } from "@/lib/session";
import ChatThread from "@/components/dashboard/ChatThread";

// A student's chat with their tutors. They always chat in their own conversation.
export default async function StudentMessagesPage() {
  const user = await requireStudent();
  return <ChatThread meId={user.id} title="Your tutors" emptyText="No messages yet. Write to your tutors, or share a file." />;
}
