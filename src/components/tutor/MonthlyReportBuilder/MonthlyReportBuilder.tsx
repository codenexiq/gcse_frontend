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
import "./print.css";
import styles from "./MonthlyReportBuilder.module.css";

/** The Monthly Report Builder: the form on the left, the finished report on the right. */
export default function MonthlyReportBuilder() {
  const { report, update, nextStudent } = useMonthlyReport();
  return (
    <div className={styles.page}>
      <ol className={styles.steps} aria-label="How it works">
        <li>Fill in the form</li><li>Check the report</li><li>Download PDF and send</li>
      </ol>
      <p className={styles.notice}>
        <strong>One form per student, about 5–10 minutes.</strong> The report on the right updates as you go. Your answers are saved in this browser until you start the next student.
      </p>
      <div className={styles.layout}>
        <div className={styles.form}>
          <MonthlyReportBasics report={report} update={update} />
          <MonthlyReportTopics report={report} update={update} />
          <MonthlyReportTests report={report} update={update} />
          <MonthlyReportBehaviours report={report} update={update} />
          <MonthlyReportComments report={report} update={update} />
          <MonthlyReportTargets report={report} update={update} />
          <MonthlyReportFinish onNextStudent={nextStudent} />
        </div>
        <div className={styles.preview}>
          <MonthlyReportPreview report={report} />
        </div>
      </div>
    </div>
  );
}
