import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import styles from "./MonthlyReportFinish.module.css";

interface Props { onNextStudent: () => void }

/** Step 7: print the report as a PDF, or start again for the next student. */
export default function MonthlyReportFinish({ onNextStudent }: Props) {
  return (
    <MonthlyReportCard number={7} title="Finish" hint="Check the report, then download it and send it on">
      <div className={styles.buttons}>
        <button type="button" className={styles.download} onClick={() => window.print()}>Download PDF</button>
        <button
          type="button"
          className={styles.next}
          onClick={() => {
            if (window.confirm("Start a new report? This clears the current student's answers.")) onNextStudent();
          }}
        >
          Start next student
        </button>
      </div>
      <p className={styles.note}>
        In the print window, choose <strong>Save as PDF</strong> as the destination. Name the file with the student and month, then email it to educatecloud.online@gmail.com.
      </p>
    </MonthlyReportCard>
  );
}
