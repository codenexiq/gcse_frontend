import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import fields from "@/components/tutor/MonthlyReportCard/MonthlyReportCard.module.css";
import { NEXT_STEPS, PROGRESS, WENT_WELL, type MonthlyReport, type UpdateReport } from "@/lib/monthlyReport";

interface Props { report: MonthlyReport; update: UpdateReport }

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

/** Step 5: tap-to-pick comments, the overall progress, and the comment for parents. */
export default function MonthlyReportComments({ report, update }: Props) {
  const pills = (items: string[], chosen: string[], key: "wentWell" | "nextSteps") => (
    <div className={fields.pills}>
      {items.map((t) => (
        <button key={t} type="button" aria-pressed={chosen.includes(t)} className={`${fields.pill} ${chosen.includes(t) ? fields.on : ""}`} onClick={() => update({ [key]: toggle(chosen, t) })}>{t}</button>
      ))}
    </div>
  );
  return (
    <MonthlyReportCard number={5} title="Comments" hint="Tap from the comment bank, and add a sentence if you like">
      <p className={fields.sub} style={{ marginTop: 0 }}>What went well</p>
      {pills(WENT_WELL, report.wentWell, "wentWell")}
      <label className={fields.field} style={{ marginTop: "0.9rem" }}>
        One specific example (optional)
        <textarea className={fields.input} value={report.example} maxLength={400} onChange={(e) => update({ example: e.target.value })} />
      </label>

      <p className={fields.sub}>Next steps</p>
      {pills(NEXT_STEPS, report.nextSteps, "nextSteps")}
      <label className={fields.field} style={{ marginTop: "0.9rem" }}>
        One specific target (optional)
        <textarea className={fields.input} value={report.specificTarget} maxLength={400} onChange={(e) => update({ specificTarget: e.target.value })} />
      </label>

      <div className={fields.grid} style={{ marginTop: "0.9rem" }}>
        <label className={fields.field}>
          Overall progress
          <select className={fields.input} value={report.progress} onChange={(e) => update({ progress: e.target.value })}>
            {PROGRESS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className={fields.field}>
          Working at now (grade or level)
          <input className={fields.input} value={report.workingAt} placeholder="e.g. 5" maxLength={12} onChange={(e) => update({ workingAt: e.target.value })} />
        </label>
        <label className={fields.field}>
          Target grade
          <input className={fields.input} value={report.targetGrade} placeholder="e.g. 6" maxLength={12} onChange={(e) => update({ targetGrade: e.target.value })} />
        </label>
      </div>
      <label className={fields.field} style={{ marginTop: "0.9rem", maxWidth: "14rem" }}>
        Parent call needed?
        <select className={fields.input} value={report.parentCall ? "yes" : "no"} onChange={(e) => update({ parentCall: e.target.value === "yes" })}>
          <option value="no">No</option>
          <option value="yes">Yes, please arrange</option>
        </select>
      </label>
      <p className={fields.hint} style={{ margin: "0.6rem 0", fontSize: "0.72rem", color: "var(--ec-stone-500)" }}>
        Base the working grade on tests, classwork and independent work together, not test scores alone.
      </p>
      <label className={fields.field}>
        Tutor comment for parents (1–2 sentences, honest and balanced)
        <textarea className={fields.input} value={report.comment} maxLength={600} onChange={(e) => update({ comment: e.target.value })} />
      </label>
    </MonthlyReportCard>
  );
}
