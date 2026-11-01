import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import fields from "@/components/tutor/MonthlyReportCard/MonthlyReportCard.module.css";
import type { StudentSummary } from "@/types";
import { monthOptions, SUBJECTS, TIERS, YEAR_GROUPS, type MonthlyReport, type UpdateReport } from "@/lib/monthlyReport";

interface Props { report: MonthlyReport; update: UpdateReport; students: StudentSummary[] }

/** Step 1: who the report is about. */
export default function MonthlyReportBasics({ report, update, students }: Props) {
  const months = monthOptions();
  const withCurrent = (list: string[], value: string) => (list.includes(value) ? list : [value, ...list]);
  const select = (label: string, key: "subject" | "yearGroup" | "tier" | "month", list: string[]) => (
    <label className={fields.field}>
      {label}
      <select className={fields.input} value={report[key]} onChange={(e) => update({ [key]: e.target.value })}>
        {withCurrent(list, report[key]).map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  return (
    <MonthlyReportCard number={1} title="Basics" hint="About 1 minute">
      <div className={fields.grid}>
        <label className={fields.field}>
          Your name
          <input className={fields.input} value={report.yourName} placeholder="e.g. Ms Fatima Noor" maxLength={100} onChange={(e) => update({ yourName: e.target.value })} />
        </label>
        <label className={fields.field}>
          Registered student (to send it to)
          <select
            className={fields.input}
            value={report.studentId ?? ""}
            onChange={(e) => {
              const picked = students.find((s) => s.id === Number(e.target.value));
              update(picked ? { studentId: picked.id, studentName: picked.full_name || report.studentName } : { studentId: null });
            }}
          >
            <option value="">Not chosen</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name ? `${s.full_name} (${s.email})` : s.email}</option>)}
          </select>
        </label>
        <label className={fields.field}>
          Student name
          <input className={fields.input} value={report.studentName} placeholder="First and last name" maxLength={100} onChange={(e) => update({ studentName: e.target.value })} />
        </label>
        {select("Subject", "subject", SUBJECTS)}
        {select("Year group", "yearGroup", YEAR_GROUPS)}
        {select("Tier or pathway", "tier", TIERS)}
        {select("Reporting month", "month", months)}
        <label className={fields.field}>
          Sessions attended
          <input className={fields.input} type="number" min={0} max={99} value={report.attended} onChange={(e) => update({ attended: e.target.value })} />
        </label>
        <label className={fields.field}>
          Sessions held
          <input className={fields.input} type="number" min={0} max={99} value={report.held} onChange={(e) => update({ held: e.target.value })} />
        </label>
      </div>
    </MonthlyReportCard>
  );
}
