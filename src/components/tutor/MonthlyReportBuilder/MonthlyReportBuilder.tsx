"use client";

import MonthlyReportBasics from "@/components/tutor/MonthlyReportBasics";
import MonthlyReportBehaviours from "@/components/tutor/MonthlyReportBehaviours";
import MonthlyReportComments from "@/components/tutor/MonthlyReportComments";
import MonthlyReportFinish from "@/components/tutor/MonthlyReportFinish";
import MonthlyReportPreview from "@/components/tutor/MonthlyReportPreview";
import MonthlyReportTargets from "@/components/tutor/MonthlyReportTargets";
import MonthlyReportTests from "@/components/tutor/MonthlyReportTests";
import MonthlyReportTopics from "@/components/tutor/MonthlyReportTopics";
import useMonthlyReport from "@/hooks/useMonthlyReport";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { sendMonthlyReport } from "@/services/monthlyReportService";
import type { StudentSummary } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./print.css";
import styles from "./MonthlyReportBuilder.module.css";

/** The Monthly Report Builder: the form on the left, the finished report on the right. */
export default function MonthlyReportBuilder({ students }: { students: StudentSummary[] }) {
  const { report, update, nextStudent } = useMonthlyReport();
  const toast = useToast();
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function send() {
    if (report.studentId === null) return;
    setSending(true);
    try {
      await sendMonthlyReport(report.studentId, report);
      toast.success(`Saved, and now on ${report.studentName || "the student"}'s dashboard.`, { title: "Report created" });
      nextStudent(); // the draft is saved, so the form starts fresh
      router.push("/tutor/dashboard/monthly-progress");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send the report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <ol className={styles.steps} aria-label="How it works">
        <li>Fill in the form</li><li>Check the report</li><li>Generate the report</li>
      </ol>
      <p className={styles.notice}>
        <strong>One form per student, about 5–10 minutes.</strong> The report on the right updates as you go. Your answers are kept in this browser until you generate the report. Generating it saves it and shows it on the student's dashboard.
      </p>
      <div className={styles.layout}>
        <div className={styles.form}>
          <MonthlyReportBasics report={report} update={update} students={students} />
          <MonthlyReportTopics report={report} update={update} />
          <MonthlyReportTests report={report} update={update} />
          <MonthlyReportBehaviours report={report} update={update} />
          <MonthlyReportComments report={report} update={update} />
          <MonthlyReportTargets report={report} update={update} />
          <MonthlyReportFinish onNextStudent={nextStudent} onSend={send} canSend={report.studentId !== null} sending={sending} />
        </div>
        <div className={styles.preview}>
          <MonthlyReportPreview report={report} />
        </div>
      </div>
    </div>
  );
}
