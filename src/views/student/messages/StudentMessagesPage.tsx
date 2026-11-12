import StudentMessages from "@/components/adm/student/messages/StudentMessages";
import Empty from "@/components/adm/ui/Empty";
import { serverFetch } from "@/lib/serverApi";
import type { ThreadDetail } from "@/types/admin";
import type { StudentThread } from "@/types/student";

/** Student > Messages: the conversation in the address, or the first. Opening a conversation marks it as read. */
export default async function StudentMessagesPage({ thread }: { thread?: string }) {
  const threads = await serverFetch<StudentThread[]>("/student/messages/threads");
  if (threads.length === 0) return <Empty title="No teacher yet" text="Once a teacher is assigned you can message them here." />;
  const wanted = Number(thread);
  const id = threads.some((t) => t.id === wanted) ? wanted : threads[0].id;
  const current = await serverFetch<ThreadDetail>(`/student/messages/threads/${id}`);
  return <StudentMessages key={id} threads={threads} initial={current} />;
}
