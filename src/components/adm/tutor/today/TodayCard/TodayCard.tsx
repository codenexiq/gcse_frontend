import AgendaRow from "@/components/adm/tutor/today/AgendaRow";
import Icon from "@/components/adm/ui/Icon";
import type { Session } from "@/types/tutor";

/** Today's sessions. */
export default function TodayCard({ sessions }: { sessions: Session[] }) {
  return (
    <section className="card">
      <h2>
        <Icon name="clock" /> Today
      </h2>
      {sessions.length ? (
        <ul className="agenda">
          {sessions.map((b) => (
            <AgendaRow key={b.id} session={b} />
          ))}
        </ul>
      ) : (
        <p className="muted">No sessions today.</p>
      )}
    </section>
  );
}
