import Link from "next/link";
import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { KIND, STATUS_LABEL } from "@/lib/content";
import { niceTime, shortDate } from "@/lib/format";
import { topicIcon } from "@/lib/icons";
import type { StudentHomeData } from "@/types/student";

type Current = NonNullable<StudentHomeData["current"]>;

const statusChip = (k: keyof typeof STATUS_LABEL) => <Chip tone={STATUS_LABEL[k][1]}>{STATUS_LABEL[k][0]}</Chip>;
const first = (n: string) => n.trim().split(/\s+/)[0] || "there";

/** The student's home: a tab for each subject, then (for the chosen one) the diagnostic or tasks, live lessons, progress and learning map. */
export default function StudentHome({ data, current: e }: { data: StudentHomeData; current: Current }) {
  const { student } = data;
  const pct = Math.round((e.mastered / Math.max(1, e.total)) * 100);

  return (
    <>
      <div className="row between home-head">
        <div>
          <h1>Hi {first(student.name)}</h1>
          <p className="muted">
            {student.level} {student.plan.name && <Chip tone="c-cream">{student.plan.name}</Chip>}
          </p>
        </div>
      </div>

      <div className="sub-tabs" role="tablist" aria-label="Your subjects">
        {data.subjects.map((s) => (
          <Link key={s.id} href={`/student?enrolment=${s.id}`} role="tab" className="sub-tab" aria-selected={s.id === e.id}>
            <SubjectBadge icon={s.subject.icon} color={s.subject.color} />
            <span>{s.pathName}</span>
            {!s.diagnosticDone && <span className="dotn" aria-label="Diagnostic to do" />}
          </Link>
        ))}
      </div>

      {!e.diagnosticDone ? (
        <div className="card cta-card">
          <div className="row">
            <SubjectBadge icon={e.subject.icon} color={e.subject.color} size="xl" />
            <div className="stack" style={{ gap: 6 }}>
              <h2>Start your {e.subject.name} diagnostic</h2>
              <p className="muted">Rate how confident you are with each topic. About 3 minutes. It finds your gaps and builds your learning map.</p>
              <div className="row">
                <Link href={`/student/diagnostic/${e.id}`} className="btn primary lg">
                  <Icon name="play" />
                  Start diagnostic
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="home-grid">
            <section className="card">
              <div className="row between">
                <h2>
                  <Icon name="quiz" /> Your tasks
                </h2>
                {e.tasks[0] && <span className="small muted">{e.tasks[0].routeName}</span>}
              </div>
              {e.tasks.length === 0 ? (
                <p className="small muted">No tasks yet. Your teacher will add lessons, notes and quizzes here.</p>
              ) : (
                <ol className="tasks">
                  {e.tasks.slice(0, 6).map((t) => (
                    <li key={`${t.routeName}-${t.itemId}`} className={t.done ? "done" : ""}>
                      <span className={`kind k-${t.kind}`}>
                        <Icon name={KIND[t.kind].icon} />
                      </span>
                      <div className="stack grow">
                        <strong>{t.title}</strong>
                        <span className="small muted">
                          {KIND[t.kind].label}
                          {t.topic ? ` · ${t.topic}` : ""}
                        </span>
                      </div>
                      {t.done ? (
                        <Chip tone="c-navy">Done ✓</Chip>
                      ) : (
                        <>
                          <Chip tone={t.late ? "c-pink" : "c-cream"}>{t.late ? "Overdue" : `Due ${shortDate(t.due)}`}</Chip>
                          <Link href={`/student/items/${t.itemId}?enrolment=${e.id}`} className="btn primary sm">
                            {t.kind === "quiz" ? "Start quiz" : "Open"}
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <div className="stack">
              <section className="card">
                <h2>
                  <Icon name="calendar" /> Live lessons
                </h2>
                {!student.plan.live ? (
                  <p className="small muted">You are on the {student.plan.name || "Self-paced"} plan. Live classes come with Weekly class or Exam intensive.</p>
                ) : e.sessions.length === 0 ? (
                  <p className="small muted">Your teacher is setting up your class. You will get a message when it is booked.</p>
                ) : (
                  e.sessions.map((s) => (
                    <div className="row between mini" key={s.id}>
                      <span>
                        <strong>{shortDate(s.date)}</strong> · {niceTime(s.start)}
                        <span className="small muted block">{s.who}</span>
                      </span>
                      {/^https?:\/\//.test(s.zoom) ? (
                        <a className="btn sm" href={s.zoom} target="_blank" rel="noopener noreferrer">
                          Join
                        </a>
                      ) : null}
                    </div>
                  ))
                )}
              </section>
              <section className="card">
                <h2>
                  <Icon name="chart" /> Progress
                </h2>
                <div className="kpis2">
                  <div>
                    <span>Mastered</span>
                    <b>
                      {e.mastered}/{e.total}
                    </b>
                  </div>
                  <div>
                    <span>Now</span>
                    <b>{e.currentGrade || "—"}</b>
                  </div>
                  <div>
                    <span>Target</span>
                    <b>{e.targetGrade || "—"}</b>
                  </div>
                </div>
                <div className="bar">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </section>
            </div>
          </div>

          <div className="row between" style={{ margin: "28px 0 12px" }}>
            <h2>{e.subject.name} learning map</h2>
            <div className="row legend">
              {statusChip("M")}
              {statusChip("P")}
              {statusChip("W")}
              {statusChip("N")}
            </div>
          </div>
          <div className="grid-map">
            {e.strands.map((st) => {
              const mm = st.topics.filter((t) => t.status === "M").length;
              return (
                <article className="card strand" key={st.id}>
                  <div className="row between">
                    <h3 className="row">
                      <span className="tic">
                        <Icon name={topicIcon(st.name)} />
                      </span>
                      {st.name}
                    </h3>
                    <span className="small muted">
                      {mm}/{st.topics.length}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${Math.round((mm / Math.max(1, st.topics.length)) * 100)}%` }} />
                  </div>
                  <div className="topics">
                    {st.topics.map((t) => (
                      <Link key={t.id} href={`/student/topics/${t.id}?enrolment=${e.id}`} className={`topic st-${t.status}`}>
                        <span className="tic sm">
                          <Icon name={topicIcon(st.name, t.name)} />
                        </span>
                        <span className="grow">{t.name}</span>
                        {statusChip(t.status)}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
