import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import type { OverviewData } from "@/types/admin";

/** How many pathways each subject has, as a coloured bar. */
export default function SubjectsCard({ subjects }: { subjects: OverviewData["subjects"] }) {
  return (
    <section className="card">
      <h2>
        <Icon name="book" /> Subjects
      </h2>
      {subjects.length === 0 ? (
        <p className="muted small">No enrolments yet.</p>
      ) : (
        subjects.map((s) => (
          <div className="barrow" key={s.id}>
            <span className="row tight">
              <SubjectBadge icon={s.icon} color={s.color} size="sm" />
              {s.name}
            </span>
            <span className="bar">
              <span style={{ width: `${s.percent}%`, background: s.color }} />
            </span>
            <strong>{s.count}</strong>
          </div>
        ))
      )}
    </section>
  );
}
