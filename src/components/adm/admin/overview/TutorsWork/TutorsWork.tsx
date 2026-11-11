import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import { plural } from "@/lib/format";
import type { OverviewData } from "@/types/admin";

/** Each tutor's student count and whether their lesson logs are up to date. */
export default function TutorsWork({ tutors }: { tutors: OverviewData["tutors"] }) {
  return (
    <section className="card">
      <h2>
        <Icon name="users" /> Tutors
      </h2>
      {tutors.map((t) => (
        <div className="barrow" key={t.id}>
          <span>{t.name}</span>
          <span className="small muted">{plural(t.students, "student")}</span>
          {t.pendingLogs ? <Chip tone="c-pink">{t.pendingLogs} to log</Chip> : <Chip tone="c-navy">Logs up to date</Chip>}
        </div>
      ))}
    </section>
  );
}
