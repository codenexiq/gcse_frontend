import Icon from "@/components/adm/ui/Icon";
import { fileSize, fmtTime } from "@/lib/format";
import type { Attachment, Sender, ThreadDetail } from "@/types/admin";

export function AttachmentView({ a }: { a: Attachment }) {
  if (a.data && a.type.startsWith("image/")) {
    return (
      <div className="att">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.data} alt={a.name} />
        <span>
          {a.name} · {fileSize(a.size)}
        </span>
      </div>
    );
  }
  return (
    <div className="att file">
      <Icon name="notes" />
      <span>
        {a.name} · {fileSize(a.size)}
      </span>
    </div>
  );
}

/** The messages of one conversation, as seen by `viewer`: their own are "You"; the admin's show as the "Educate Cloud team". */
export default function ChatBubbles({ thread, viewer }: { thread: ThreadDetail; viewer: Sender }) {
  if (thread.messages.length === 0) return <p className="muted" style={{ padding: 12 }}>No messages yet. Say hello.</p>;
  const names = { student: thread.studentName, tutor: thread.tutorName, admin: "Educate Cloud team" };
  return (
    <>
      {thread.messages.map((m) => {
        const mine = m.from === viewer;
        return (
          <div key={m.id} className={`bubble ${mine ? "me" : m.from === "admin" ? "adm" : "them"}`}>
            {m.text}
            {m.attachment && <AttachmentView a={m.attachment} />}
            <time>
              {mine ? "You" : names[m.from]} · {fmtTime(m.at)}
            </time>
          </div>
        );
      })}
    </>
  );
}
