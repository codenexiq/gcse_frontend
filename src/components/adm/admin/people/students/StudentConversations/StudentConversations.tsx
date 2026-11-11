import Link from "next/link";
import Icon from "@/components/adm/ui/Icon";
import { plural } from "@/lib/format";
import type { StudentDetail } from "@/types/admin";

/** The student's conversations with their tutors; each opens in Messages. */
export default function StudentConversations({ conversations }: { conversations: StudentDetail["conversations"] }) {
  return (
    <section className="card">
      <h2>
        <Icon name="message" /> Conversations
      </h2>
      {conversations.length === 0 ? (
        <p className="muted small">None yet.</p>
      ) : (
        conversations.map((t) => (
          <Link key={t.id} href={`/admin/messages?thread=${t.id}`} className="list-btn">
            <strong>With {t.tutorName}</strong>
            <span className="small muted">{plural(t.messages, "message")}</span>
          </Link>
        ))
      )}
    </section>
  );
}
