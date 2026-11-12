import AgendaRow from "@/components/adm/tutor/today/AgendaRow";
import Icon from "@/components/adm/ui/Icon";
import type { Session } from "@/types/tutor";

/** Sessions that are over and still need a log. Logs feed the monthly reports. */
export default function PendingLogs({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;
  return (
    <section className="card warn-card">
      <h2>
        <Icon name="edit" /> Log these sessions
      </h2>
      <p className="small muted">Takes 30 seconds. Logs feed the monthly reports.</p>
      <ul className="agenda">
        {sessions.map((b) => (
          <AgendaRow key={b.id} session={b} logIt />
        ))}
      </ul>
    </section>
  );
}
