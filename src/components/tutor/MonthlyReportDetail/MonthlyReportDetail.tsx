"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import MonthlyReportPreview from "@/components/tutor/MonthlyReportPreview";
import "@/components/tutor/MonthlyReportBuilder/print.css";
import useReportPdf from "@/hooks/useReportPdf";
import { emptyReport, type MonthlyReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportDetail.module.css";

/** One student's report, as the student sees it. */
export default function MonthlyReportDetail({ report, sentOn, studentId, studentName }: { report: MonthlyReport; sentOn: string; studentId: number; studentName: string }) {
  const full = { ...emptyReport(), ...report };
  const pdf = useReportPdf();
  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <Link href={`/tutor/dashboard/monthly-progress/student/${studentId}`} className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> {studentName}&rsquo;s reports</Link>
        <button type="button" className={styles.download} onClick={() => pdf.download(full.studentName || studentName, full.month)} disabled={pdf.busy}><Download size={16} aria-hidden="true" /> {pdf.busy ? "Preparing PDF..." : "Download PDF"}</button>
      </div>
      <MonthlyReportPreview report={full} date={new Date(sentOn).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
    </div>
  );
}
