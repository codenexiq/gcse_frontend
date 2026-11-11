import MessagesView from "@/components/adm/admin/messages/MessagesView";
import Empty from "@/components/adm/ui/Empty";
import { serverFetch } from "@/lib/serverApi";
import type { ThreadDetail, ThreadSummary } from "@/types/admin";

/** Admin > Messages: read every conversation (the one in the address, or the newest). */
export default async function MessagesPage({ thread }: { thread?: string }) {
  const threads = await serverFetch<ThreadSummary[]>("/admin/messages/threads");
  if (threads.length === 0) return <Empty title="No messages yet" text="Conversations between students and tutors appear here." />;
  const wanted = thread ?? "";
  const id = threads.some((t) => t.id === wanted) ? wanted : threads[0].id;
  const current = await serverFetch<ThreadDetail>(`/admin/messages/threads/${id}`);
  return <MessagesView key={id} threads={threads} initial={current} />;
}
