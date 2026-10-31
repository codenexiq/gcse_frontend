import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import fields from "@/components/tutor/MonthlyReportCard/MonthlyReportCard.module.css";
import { emptyTarget, type MonthlyReport, type TargetRow, type UpdateReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportTargets.module.css";

interface Props { report: MonthlyReport; update: UpdateReport }

/** Step 6: one to three specific targets, and the plan for next month. */
export default function MonthlyReportTargets({ report, update }: Props) {
  const change = (i: number, patch: Partial<TargetRow>) => update({ targets: report.targets.map((t, n) => (n === i ? { ...t, ...patch } : t)) });
  return (
    <MonthlyReportCard number={6} title="Targets and plan for next month" hint="About 2–3 minutes · 1 to 3 targets. Make each one specific and measurable.">
      <div className={fields.stack}>
        {report.targets.map((t, i) => (
          <div key={i} className={styles.target}>
            <div className={styles.head}>
              <strong>Target {i + 1}</strong>
              {report.targets.length > 1 && (
                <button type="button" className={fields.remove} aria-label={`Remove target ${i + 1}`} onClick={() => update({ targets: report.targets.filter((_, n) => n !== i) })}>×</button>
              )}
            </div>
            <label className={fields.field}>
              What is the target?
              <input className={fields.input} value={t.what} maxLength={200} onChange={(e) => change(i, { what: e.target.value })} />
            </label>
            <div className={styles.three}>
              <label className={fields.field}>
                The student will
                <textarea className={fields.input} value={t.student} maxLength={300} onChange={(e) => change(i, { student: e.target.value })} />
              </label>
              <label className={fields.field}>
                I (the tutor) will
                <textarea className={fields.input} value={t.tutor} maxLength={300} onChange={(e) => change(i, { tutor: e.target.value })} />
              </label>
              <label className={fields.field}>
                Measured by, and when
                <textarea className={fields.input} value={t.measured} maxLength={300} onChange={(e) => change(i, { measured: e.target.value })} />
              </label>
            </div>
          </div>
        ))}
        {report.targets.length < 3 && <button type="button" className={fields.addBtn} onClick={() => update({ targets: [...report.targets, emptyTarget()] })}>+ Add a target</button>}

        <div className={fields.grid2}>
          <label className={fields.field}>
            Topics planned for next month
            <textarea className={fields.input} value={report.topicsNext} maxLength={400} onChange={(e) => update({ topicsNext: e.target.value })} />
          </label>
          <label className={fields.field}>
            Upcoming tests or key dates (optional)
            <textarea className={fields.input} value={report.keyDates} maxLength={400} onChange={(e) => update({ keyDates: e.target.value })} />
          </label>
        </div>
        <label className={fields.field}>
          How parents can help at home
          <textarea className={fields.input} value={report.homeHelp} maxLength={500} onChange={(e) => update({ homeHelp: e.target.value })} />
        </label>
      </div>
    </MonthlyReportCard>
  );
}
