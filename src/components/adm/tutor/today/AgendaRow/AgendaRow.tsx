import Link from "next/link";
import Chip from "@/components/adm/ui/Chip";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import JoinButton from "@/components/adm/tutor/today/JoinButton";
import { endTime, niceTime, shortDate } from "@/lib/format";
import type { Session } from "@/types/tutor";

/** One session: its subject, who it is for, when, and a Log button (when it is over and not logged), a "Logged" chip, or a Join button. */
export default function AgendaRow({ session: b, logIt }: { session: Session; logIt?: boolean }) {
  return (
    <li className="ag">
      {b.subject && <SubjectBadge icon={b.subject.icon} color={b.subject.color} />}
      <div className="grow stack">
        <strong>{b.who}</strong>
        <span className="small muted">
          {shortDate(b.date)} · {niceTime(b.start)}–{niceTime(endTime(b.start, b.mins))}
          {b.kind === "one" ? " · 1:1" : ""}
        </span>
      </div>
      {logIt || (b.past && !b.logged) ? (
        <Link href={`/tutor?log=${b.id}`} className="btn primary sm">Log</Link>
      ) : b.past ? (
        <Chip tone="c-navy">Logged</Chip>
      ) : (
        <JoinButton />
      )}
    </li>
  );
}
