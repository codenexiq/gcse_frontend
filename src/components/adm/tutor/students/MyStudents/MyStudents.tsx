import Link from "next/link";
import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { DAYS } from "@/lib/icons";
import { niceTime, plural } from "@/lib/format";
import type { MyStudents as MyStudentsData } from "@/types/tutor";

/** My students (every subject of mine, with grades and how much is mastered) and my groups. Contact details are never shown. */
export default function MyStudents({ data }: { data: MyStudentsData }) {
  return (
    <>
      <section className="card">
        <div className="row between">
          <h2>
            <Icon name="users" /> My students
          </h2>
          <span className="small muted">
            <Icon name="lock" /> Emails, phone numbers and parent details are held by the admin team.
          </span>
        </div>
        {data.students.length ? (
          <div className="slist">
            {data.students.map((s) => (
              <Link key={s.enrolmentId} href={`/tutor/students/${s.enrolmentId}`} className="srow">
                <SubjectBadge icon={s.subject.icon} color={s.subject.color} />
                <span className="stack grow">
                  <strong>{s.name}</strong>
                  <span className="small muted">
                    {s.year} · {s.pathName}
                    {s.groupName ? ` · ${s.groupName}` : " · 1:1 / no group"}
                  </span>
                </span>
                <span className="grades">
                  <span title="Current grade">{s.current || "–"}</span>
                  <span className="arrow">→</span>
                  <span className="tgt" title="Target grade">{s.target || "–"}</span>
                </span>
                <span className="meter" title={`${s.mastered} of ${s.total} topics mastered`}>
                  <span style={{ width: `${s.total ? Math.round((s.mastered / s.total) * 100) : 0}%` }} />
                </span>
                {!s.diagnosticDone && <Chip tone="c-cream">Diagnostic to do</Chip>}
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No students yet. The admin team assigns students to you.</p>
        )}
      </section>
      {data.groups.length > 0 && (
        <section className="card">
          <h2>
            <Icon name="users" /> My groups
          </h2>
          <div className="mini-grid">
            {data.groups.map((g) => (
              <div className="mini-card" key={g.id}>
                <SubjectBadge icon={g.subject.icon} color={g.subject.color} />
                <div className="stack">
                  <strong>{g.name}</strong>
                  <span className="small muted">
                    {DAYS[g.day]}s {niceTime(g.start)} · {plural(g.students, "student")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
