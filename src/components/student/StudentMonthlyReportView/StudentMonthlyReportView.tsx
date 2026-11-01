"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import MonthlyReportPreview from "@/components/tutor/MonthlyReportPreview";
import "@/components/tutor/MonthlyReportBuilder/print.css";
import { emptyReport, type MonthlyReport } from "@/lib/monthlyReport";
import styles from "./StudentMonthlyReportView.module.css";

/** A report from a tutor, shown exactly as the PDF will look. Read-only: there is nothing to edit here. */
export default function StudentMonthlyReportView({ report, sentOn }: { report: MonthlyReport; sentOn: string }) {
  // Fill any gap, so a report saved by an older version of the builder still displays.
  const full = { ...emptyReport(), ...report };
  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <Link href="/student/monthly-progress" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> All reports</Link>
        <button type="button" className={styles.download} onClick={() => window.print()}><Download size={16} aria-hidden="true" /> Download PDF</button>
      </div>
      <p className={styles.note}>In the print window, choose <strong>Save as PDF</strong> as the destination.</p>
      <div className={styles.report}>
        <MonthlyReportPreview report={full} date={new Date(sentOn).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
      </div>
    </div>
  );
}
