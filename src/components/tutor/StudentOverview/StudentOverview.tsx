"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentMonthReport from "@/components/tutor/StudentMonthReport";
import { niceDate, niceTime } from "@/lib/calendar";
import { assignRoute } from "@/services/routeService";
import type { StudentOverview as Data } from "@/types";
import styles from "./StudentOverview.module.css";

const dash = "—";

/** One student's page for a tutor, as in the prototype: profile, learning route, upcoming sessions and recent session logs. */
export default function StudentOverview({ data, allRoutes }: { data: Data; allRoutes: { id: number; name: string }[] }) {
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);
  const [routeError, setRouteError] = useState("");
  const { about } = data;
  const [report, setReport] = useState(false);
  const yearSubject = [about.schoolYear, about.subject].filter(Boolean).join(" · ") || dash;
  const lessons = data.group ? `1-to-1 + group · ${data.group.name}` : "1-to-1";
  const facts: [string, string][] = [
    ["Year and subject", yearSubject],
    ["Tier", about.tier ?? dash],
    ["Target grade", about.targetGrade ?? dash],
    ["Lessons", lessons],
    ["Parent", dash],
    ["Contact", data.phone || data.email || dash],
  ];

  async function assign(routeId: number) {
    if (!routeId) return;
    setAssigning(true);
    setRouteError("");
    try {
      await assignRoute(routeId, data.id);
      router.refresh();
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : "Could not assign the route.");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/tutor/dashboard/students" className={styles.back}>&lsaquo; All students</Link>

      <section className={styles.card} aria-label="Student profile">
        <div className={styles.between}>
          <div>
            <span className={styles.eyebrow}>Student profile</span>
            <h2 className={styles.name}>{data.fullName || "Name not given"}</h2>
          </div>
          <div className={styles.buttons}>
            <Link href="/tutor/dashboard" className={styles.primary}>Book lessons</Link>
            <Link href={`/tutor/dashboard/messages?student=${data.id}`} className={styles.outline}>Message</Link>
            <button type="button" className={styles.outline} aria-expanded={report} onClick={() => setReport((open) => !open)}>{report ? "Hide report" : "Monthly report"}</button>
          </div>
        </div>
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={styles.two}>
        <section className={styles.card} aria-label="Learning route">
          <div className={`${styles.between} ${styles.center}`}>
            <h3 className={styles.h}>Learning route</h3>
            {allRoutes.length > 0 && (
              <label className={styles.assign}>
                Assign
                <select value="" disabled={assigning} onChange={(e) => void assign(Number(e.target.value))}>
                  <option value="">Choose...</option>
                  {allRoutes.filter((r) => !data.routes.some((x) => x.id === r.id)).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            )}
          </div>
          {routeError && <p className={styles.muted} role="alert">{routeError}</p>}
          {data.routes.length === 0 ? (
            <p className={styles.muted}>No route yet. Assign one so lessons and quizzes appear on their task list in order. <Link href="/tutor/dashboard/routes" className={styles.link}>Manage routes</Link></p>
          ) : (
            data.routes.map((r) => (
              <div key={r.id} className={styles.route}>
                <div className={`${styles.between} ${styles.center}`}>
                  <strong>{r.name}</strong>
                  <span className={styles.muted}>{r.steps.filter((s) => s.done).length} of {r.steps.length} done</span>
                </div>
                <ol className={styles.routeList}>
                  {r.steps.map((s, i) => (
                    <li key={i} className={s.done ? styles.stepDone : ""}>
                      <span>{s.title}{s.published ? "" : " (hidden)"}</span>
                      <span className={styles.muted}>Week {s.week}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
          <Link href={`/tutor/dashboard/students/${data.id}/review`} className={styles.link}>See diagnostic results</Link>
        </section>

        <section className={styles.card} aria-label="Upcoming sessions">
          <h3 className={styles.h}>Upcoming sessions</h3>
          {data.upcoming.length === 0 ? (
            <p className={styles.muted}>Nothing booked yet.</p>
          ) : (
            <ul className={styles.list}>
              {data.upcoming.map((s) => (
                <li key={s.id} className={styles.row}>
                  <span>
                    <strong>{niceDate(s.date)}</strong> &middot; {niceTime(s.startTime)}
                  </span>
                  <span className={`${styles.chip} ${s.kind === "group" ? styles.blue : styles.pink}`}>{s.kind === "group" ? "Group" : "1-to-1"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.card} aria-label="Recent session logs">
        <h3 className={styles.h}>Recent session logs</h3>
        {data.logs.length === 0 ? (
          <p className={styles.muted}>No sessions have been logged yet.</p>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Topics</th>
                  <th scope="col">Next step</th>
                  <th scope="col">Engagement</th>
                  <th scope="col">Focus</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((l) => (
                  <tr key={l.id}>
                    <td className={styles.date}>{niceDate(l.date)}</td>
                    <td>{l.topics || dash}</td>
                    <td>{l.nextStep || dash}</td>
                    <td>{l.engagement ? `${l.engagement}/5` : dash}</td>
                    <td>{l.focus ? `${l.focus}/5` : dash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.card} aria-label="Lesson results">
        <h3 className={styles.h}>Lesson results</h3>
        {data.results.length === 0 ? (
          <p className={styles.muted}>No lessons finished yet.</p>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Lesson</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.date}>{niceDate(r.at.slice(0, 10))}</td>
                    <td>{r.topic}</td>
                    <td>{r.title}</td>
                    <td>{r.got}/{r.max} ({r.percent}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {report && <StudentMonthReport studentId={data.id} />}
    </div>
  );
}
