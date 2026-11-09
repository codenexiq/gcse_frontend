import { requireTutor } from "@/lib/session";
import { getChatConversations, getChatGroups } from "@/services/chatService/chatService.server";
import { getGroups, getStudents, getWaitingStudents } from "@/services/tutorService";
import ChatInbox from "@/components/dashboard/ChatInbox";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins only: chat with the students, under the teacher tabs. Each tutor or admin has their own chat with each student.
export default async function MessagesPage({ searchParams }: { searchParams?: Promise<{ student?: string }> }) {
  const user = await requireTutor();
  try {
    const [conversations, groups, students, tutorGroups, waiting] = await Promise.all([
      getChatConversations(),
      getChatGroups(),
      getStudents(),
      getGroups().catch(() => []),
      getWaitingStudents().catch(() => []),
    ]);
    // "Message" on a student's page comes here with ?student=<id>: that student's chat opens straight away.
    const wanted = Number((await searchParams)?.student);
    const student = Number.isInteger(wanted) && wanted > 0 ? students.find((s) => s.id === wanted) : undefined;
    const startWith = student
      ? conversations.find((c) => c.peerId === student.id) ?? { peerId: student.id, fullName: student.full_name ?? "", email: student.email, peerRole: "student" as const, avatarVersion: student.avatar_version ?? null, lastBody: null, lastHasFile: false, lastAt: null, unread: 0 }
      : null;
    // Only admins make groups and manage who is in them.
    return (
      <FlowScope>
        <TeacherHeader name={user.fullName || user.email} students={students.length} groups={tutorGroups.length} waiting={waiting.length} active="messages" />
        <ChatInbox initial={conversations} initialGroups={groups} meId={user.id} noun="student" startWith={startWith} canManageGroups={user.role === "admin"} />
      </FlowScope>
    );
  } catch (err) {
    return <Alert>Could not load the messages: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
