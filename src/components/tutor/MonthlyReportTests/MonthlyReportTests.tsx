import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import fields from "@/components/tutor/MonthlyReportCard/MonthlyReportCard.module.css";
import type { MonthlyReport, TestRow, UpdateReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportTests.module.css";

interface Props { report: MonthlyReport; update: UpdateReport }

/** Step 3: up to three tests sat this month. */
export default function MonthlyReportTests({ report, update }: Props) {
  const change = (i: number, patch: Partial<TestRow>) => update({ tests: report.tests.map((t, n) => (n === i ? { ...t, ...patch } : t)) });
  return (
    <MonthlyReportCard number={3} title="Tests" hint="About 1–2 minutes">
      <div className={styles.count}>
        <span className={styles.countLabel}>Tests this month</span>
        <div className={styles.counter} role="group" aria-label="Tests this month">
          {[0, 1, 2, 3].map((n) => (
            <button key={n} type="button" aria-pressed={report.testCount === n} className={`${styles.num} ${report.testCount === n ? styles.on : ""}`} onClick={() => update({ testCount: n })}>{n}</button>
          ))}
        </div>
      </div>
      <div className={fields.stack}>
        {report.tests.slice(0, report.testCount).map((t, i) => (
          <div key={i} className={styles.test}>
            <label className={`${fields.field} ${styles.wide}`}>
              Test {i + 1} name or topic
              <input className={fields.input} value={t.name} maxLength={120} onChange={(e) => change(i, { name: e.target.value })} />
            </label>
            <label className={fields.field}>
              Score
              <input className={fields.input} type="number" min={0} value={t.score} onChange={(e) => change(i, { score: e.target.value })} />
            </label>
            <label className={fields.field}>
              Out of
              <input className={fields.input} type="number" min={1} value={t.outOf} onChange={(e) => change(i, { outOf: e.target.value })} />
            </label>
            <label className={fields.field}>
              Grade / level
              <input className={fields.input} value={t.grade} placeholder="optional" maxLength={12} onChange={(e) => change(i, { grade: e.target.value })} />
            </label>
          </div>
        ))}
      </div>
    </MonthlyReportCard>
  );
}
