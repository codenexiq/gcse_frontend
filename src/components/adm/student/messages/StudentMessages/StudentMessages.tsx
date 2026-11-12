"use client";

import ChatLayout from "@/components/adm/messages/ChatLayout";
import type { ThreadDetail } from "@/types/admin";
import type { StudentThread } from "@/types/student";

/** My conversations with my teachers. The Educate Cloud team can see all messages. */
export default function StudentMessages({ threads, initial }: { threads: StudentThread[]; initial: ThreadDetail }) {
  return (
    <ChatLayout
      items={threads.map((t) => ({
        id: t.id,
        title: t.tutorName,
        preview: t.last ? `${t.last.from === "student" ? "You: " : ""}${t.last.text || "Attachment"}` : "No messages yet",
        unread: String(t.id) === initial.id ? 0 : t.unread,
      }))}
      initial={initial}
      viewer="student"
      basePath="/student/messages"
      apiPath="/student/messages/threads"
      heading={(t) => t.tutorName}
      single={{ back: "/student" }}
      note="Keep messages about learning. The Educate Cloud team can see all messages."
    />
  );
}
