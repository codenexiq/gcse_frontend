"use client";

import ChatLayout from "@/components/adm/messages/ChatLayout";
import type { ThreadDetail } from "@/types/admin";
import type { TutorThread } from "@/types/tutor";

/** My conversations with my students. The Educate Cloud team can see all messages. */
export default function TutorMessages({ threads, initial }: { threads: TutorThread[]; initial: ThreadDetail }) {
  return (
    <ChatLayout
      items={threads.map((t) => ({
        id: t.id,
        title: t.studentName,
        preview: t.last ? `${t.last.from === "tutor" ? "You: " : ""}${t.last.text || "Attachment"}` : "No messages yet",
        // The conversation that is open has just been read.
        unread: String(t.id) === initial.id ? 0 : t.unread,
      }))}
      initial={initial}
      viewer="tutor"
      basePath="/tutor/messages"
      apiPath="/tutor/messages/threads"
      heading={(t) => t.studentName}
      note="Keep messages about learning. The Educate Cloud team can see all messages."
    />
  );
}
