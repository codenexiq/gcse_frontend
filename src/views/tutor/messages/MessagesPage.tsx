import TutorMessages from "@/components/adm/tutor/messages/TutorMessages";
import Empty from "@/components/adm/ui/Empty";
import { serverFetch } from "@/lib/serverApi";
import type { ThreadDetail } from "@/types/admin";
import type { TutorThread } from "@/types/tutor";

/** Teacher > Messages: the conversation in the address, or the newest one. Opening a conversation marks it as read. */
export default async function MessagesPage({ thread }: { thread?: string }) {
  const threads = await serverFetch<TutorThread[]>("/tutor/messages/threads");
  if (threads.length === 0) return <Empty title="No conversations" text="When students are assigned to you, you can message them here." />;
  const wanted = Number(thread);
  const id = threads.some((t) => t.id === wanted) ? wanted : threads[0].id;
  const current = await serverFetch<ThreadDetail>(`/tutor/messages/threads/${id}`);
  return <TutorMessages key={id} threads={threads} initial={current} />;
}
