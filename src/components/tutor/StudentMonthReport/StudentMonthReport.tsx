"use client";

import { useEffect, useMemo, useState } from "react";
import { getMonthReport } from "@/services/studentOverviewService";
import type { StudentMonthReport as Report } from "@/types";
import styles from "./StudentMonthReport.module.css";

const dash = "—";
const pad = (n: number) => String(n).padStart(2, "0");
const label = (month: string) => new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/** The last six months, newest first, as YYYY-MM. */
function recentMonths(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  });
}

/** The monthly progress report, opened under the session logs on a student's page: pick a month, read it, add a comment, copy it. */
export default function StudentMonthReport({ studentId }: { studentId: number }) {
  const months = useMemo(recentMonths, []);
  const [month, setMonth] = useState(months[0]);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let current = true;
    setError("");
    getMonthReport(studentId, month)
      .then((r) => current && setReport(r))
      .catch((err) => current && setError(err instanceof Error ? err.message : "Could not load the report"));
    return () => {
      current = false;
    };
  }, [studentId, month]);

  async function copy() {
    if (!report) return;
    const text = [
      `Monthly progress report - ${report.name}`,
      label(report.month),
      `Sessions: ${report.sessions.held} of ${report.sessions.booked}`,
      `Engagement: ${report.engagement ?? dash}/5, Focus: ${report.focus ?? dash}/5, Quiz average: ${report.quizAverage === null ? dash : `${report.quizAverage}%`}`,
      report.topics.length ? `Topics covered: ${report.topics.join(", ")}` : "",
      report.wentWell.length ? `What went well: ${report.wentWell.join(" ")}` : "",
      report.nextSteps.length ? `Next steps: ${report.nextSteps.join(" ")}` : "",
      comment.trim() ? `Tutor comment: ${comment.trim()}` : "",
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the text and copy it by hand.");
    }
  }

  const about = report?.about;
  const sub = report ? [label(report.month), [about?.schoolYear, about?.subject].filter(Boolean).join(" "), about?.tier].filter(Boolean).join(" · ") : "";

  return (
    <div className={styles.wrap} id="month-report">
      <label className={styles.month}>
        Month
        <select value={month} onChange={(e) => setMonth(e.target.value)} className={styles.select}>
          {months.map((m) => <option key={m} value={m}>{label(m)}</option>)}
        </select>
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {!report && !error && <p className={styles.muted}>Loading the report...</p>}

      {report && (
        <article className={styles.card} aria-label="Monthly progress report">
          <header className={styles.banner}>
            <span className={styles.eyebrow}>Monthly progress report</span>
            <h3 className={styles.name}>{report.name || "Name not given"}</h3>
            <p className={styles.sub}>{sub}</p>
          </header>

          <div className={styles.tiles}>
            <div className={styles.tile}><span>Sessions</span><strong>{report.sessions.held} of {report.sessions.booked}</strong></div>
            <div className={styles.tile}><span>Engagement</span><strong>{report.engagement === null ? dash : `${report.engagement.toFixed(1)}/5`}</strong></div>
            <div className={styles.tile}><span>Focus</span><strong>{report.focus === null ? dash : `${report.focus.toFixed(1)}/5`}</strong></div>
            <div className={styles.tile}><span>Quiz average</span><strong>{report.quizAverage === null ? dash : `${report.quizAverage}%`}</strong></div>
          </div>

          <div className={styles.two}>
            <div>
              <h4 className={styles.h}>Topics covered</h4>
              {report.topics.length === 0 ? <p className={styles.muted}>None logged this month.</p> : (
                <div className={styles.chips}>{report.topics.map((t) => <span key={t} className={styles.chip}>{t}</span>)}</div>
              )}
            </div>
            <div>
              <h4 className={styles.h}>Learning route</h4>
              <p className={styles.small}>None assigned yet</p>
            </div>
          </div>

          <div>
            <h4 className={styles.h}>Quiz and lesson scores</h4>
            {report.scores.length === 0 ? <p className={styles.muted}>No quizzes taken this month.</p> : (
              <table className={styles.table}>
                <tbody>
                  {report.scores.map((s, i) => (
                    <tr key={`${s.title}-${i}`}>
                      <td>{s.title}</td>
                      <td><span className={`${styles.pill} ${s.percent >= 70 ? styles.good : styles.warn}`}>{s.percent}% &middot; {s.percent >= 70 ? "On track" : "Needs work"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.two}>
            <section className={`${styles.note} ${styles.blue}`}>
              <h4 className={styles.h}>What went well</h4>
              {report.wentWell.length === 0 ? <p className={styles.muted}>Nothing logged.</p> : <ul>{report.wentWell.map((t) => <li key={t}>{t}</li>)}</ul>}
            </section>
            <section className={`${styles.note} ${styles.pink}`}>
              <h4 className={styles.h}>Next steps</h4>
              {report.nextSteps.length === 0 ? <p className={styles.muted}>Nothing logged.</p> : <ul>{report.nextSteps.map((t) => <li key={t}>{t}</li>)}</ul>}
            </section>
          </div>

          <label className={styles.comment}>
            <span className={styles.h}>Tutor comment</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="One or two sentences for the parent" rows={3} maxLength={600} />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} disabled title="Parent contact details are not stored yet">Send to parent</button>
            <button type="button" className={styles.outline} onClick={copy}>{copied ? "Copied" : "Copy as text"}</button>
          </div>
        </article>
      )}
    </div>
  );
}
