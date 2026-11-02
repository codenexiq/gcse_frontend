import { BEHAVIOURS, attendancePercent, summaryText, testAveragePercent, type MonthlyReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportPreview.module.css";

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** The finished report, shown beside the form and updated as the tutor types. This is what gets printed. */
export default function MonthlyReportPreview({ report: r, date }: { report: MonthlyReport; /** The date shown at the bottom; today when left out. */ date?: string }) {
  const att = attendancePercent(r);
  const avg = testAveragePercent(r);
  const tests = r.tests.slice(0, r.testCount).filter((t) => t.name.trim() || t.score.trim());
  const topics = r.topics.filter((t) => t.name.trim());
  const targets = r.targets.filter((t) => t.what.trim());
  const progressTone = r.progress === "Above target" ? styles.good : r.progress === "Below target" ? styles.low : "";

  return (
    <article className={styles.report} id="monthly-report-print" aria-label="Report preview">
      <header className={styles.top}>
        <div className={styles.brandRow}>
          {/* The same logo as the top navigation. A plain image (not next/image) so it is sure to be loaded when the page is printed. */}
          <span className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Educate Cloud" width={864} height={819} loading="eager" className={styles.logoImage} />
          </span>
          <p className={styles.brand}>Monthly progress report</p>
        </div>
        <h2 className={styles.name}>{r.studentName.trim() || "Student name"}</h2>
        <p className={styles.meta}>
          <span>{r.subject}</span><span>{r.month}</span><span>{r.yearGroup}</span><span>{r.tier} tier</span>
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.stats}>
          <div className={styles.stat}><span>Attendance</span><strong>{att === null ? "–" : `${att}%`}</strong>{att !== null && <small>{r.attended} of {r.held} sessions</small>}</div>
          <div className={styles.stat}><span>Test average</span><strong>{avg === null ? "–" : `${avg}%`}</strong></div>
          <div className={styles.stat}><span>Working at · Target</span><strong>{r.workingAt.trim() || "–"}{r.targetGrade.trim() ? ` · ${r.targetGrade.trim()}` : ""}</strong></div>
          <div className={`${styles.stat} ${progressTone}`}><span>Progress</span><strong className={styles.small}>{r.progress}</strong></div>
        </div>

        <h3 className={styles.h}>Summary</h3>
        <p className={styles.summary}>{summaryText(r)}</p>
        {r.parentCall && <p className={styles.call}>Your tutor would like a quick call with you this month. We&rsquo;ll be in touch to arrange a time.</p>}

        <h3 className={styles.h}>Test results</h3>
        {tests.length === 0 ? <p className={styles.none}>No tests this month.</p> : (
          <ul className={styles.plain}>
            {tests.map((t, i) => (
              <li key={i}><span>{t.name.trim() || `Test ${i + 1}`}</span><strong>{t.score.trim() && t.outOf.trim() ? `${t.score}/${t.outOf}` : t.score || "–"}{t.grade.trim() ? ` · ${t.grade.trim()}` : ""}</strong></li>
            ))}
          </ul>
        )}

        <h3 className={styles.h}>Topics covered</h3>
        {topics.length === 0 ? <p className={styles.none}>No topics added yet.</p> : (
          <ul className={styles.plain}>
            {topics.map((t, i) => <li key={i}><span>{t.name}</span><strong>{t.mastery || "–"}</strong></li>)}
          </ul>
        )}

        <h3 className={styles.h}>Learning behaviours</h3>
        <div className={styles.bars}>
          {BEHAVIOURS.map((b) => (
            <div key={b.key} className={styles.bar}>
              <span>{b.label}</span>
              <div className={styles.segments} aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= r.behaviours[b.key] ? styles.fill : ""} />)}
              </div>
              <strong>{r.behaviours[b.key] > 0 ? `${r.behaviours[b.key]}/5` : "-"}</strong>
            </div>
          ))}
        </div>

        {(r.wentWell.length > 0 || r.example.trim() || r.nextSteps.length > 0 || r.specificTarget.trim()) && (
          <div className={styles.two}>
            <div className={styles.well}>
              <h4>What went well</h4>
              {r.wentWell.length > 0 && <ul>{r.wentWell.map((w) => <li key={w}>{w}</li>)}</ul>}
              {r.example.trim() && <p>{r.example}</p>}
            </div>
            <div className={styles.next}>
              <h4>Next steps</h4>
              {r.nextSteps.length > 0 && <ul>{r.nextSteps.map((w) => <li key={w}>{w}</li>)}</ul>}
              {r.specificTarget.trim() && <p>{r.specificTarget}</p>}
            </div>
          </div>
        )}

        {targets.length > 0 && (
          <>
            <h3 className={styles.h}>Targets for next month</h3>
            {targets.map((t, i) => (
              <div key={i} className={styles.goal}>
                <p className={styles.goalHead}><b>{i + 1}</b>{t.what}</p>
                <div className={styles.goalCols}>
                  <div><span>The student will</span>{t.student || "–"}</div>
                  <div><span>Tutor will</span>{t.tutor || "–"}</div>
                  <div><span>Measured by</span>{t.measured || "–"}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {(r.topicsNext.trim() || r.keyDates.trim()) && (
          <>
            <h3 className={styles.h}>Plan for next month</h3>
            {r.topicsNext.trim() && <p className={styles.text}><b>Topics:</b> {r.topicsNext}</p>}
            {r.keyDates.trim() && <p className={styles.text}><b>Key dates:</b> {r.keyDates}</p>}
          </>
        )}

        {r.homeHelp.trim() && (<><h3 className={styles.h}>How you can help at home</h3><p className={styles.text}>{r.homeHelp}</p></>)}
        {r.comment.trim() && (<><h3 className={styles.h}>Tutor comment</h3><p className={styles.quote}>{r.comment}</p></>)}

        <footer className={styles.foot}>
          <span>{r.yourName.trim() ? `${r.yourName.trim()} · ` : "Tutor · "}Educate Cloud</span>
          <span suppressHydrationWarning>{date ?? today()}</span>
        </footer>
      </div>
    </article>
  );
}
