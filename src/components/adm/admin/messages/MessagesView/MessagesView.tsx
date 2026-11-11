"use client";

import ChatLayout from "@/components/adm/messages/ChatLayout";
import Icon from "@/components/adm/ui/Icon";
import type { ThreadDetail, ThreadSummary } from "@/types/admin";

/** Every student and tutor conversation, for safeguarding. The admin can reply; it shows as the "Educate Cloud team". */
export default function MessagesView({ threads, initial }: { threads: ThreadSummary[]; initial: ThreadDetail }) {
  return (
    <>
      <p className="small muted">
        <Icon name="shield" /> Every student–tutor conversation, for safeguarding. Replies you send show as “Educate Cloud team”.
      </p>
      <ChatLayout
        items={threads.map((t) => ({
          id: t.id,
          title: `${t.studentName} ↔ ${t.tutorName}`,
          preview: t.last ? `${t.last.from === "admin" ? "You: " : ""}${t.last.text || "Attachment"}` : "No messages yet",
          unread: 0,
        }))}
        initial={initial}
        viewer="admin"
        basePath="/admin/messages"
        apiPath="/admin/messages/threads"
        heading={(t) => `${t.studentName} ↔ ${t.tutorName}`}
        note="You are replying as the Educate Cloud team. Both the student and tutor see this."
      />
    </>
  );
}
