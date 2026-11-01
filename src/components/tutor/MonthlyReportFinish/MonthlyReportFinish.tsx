import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import styles from "./MonthlyReportFinish.module.css";

interface Props {
  onNextStudent: () => void;
  /** Sends the report to the chosen student. */
  onSend: () => void;
  canSend: boolean;
  sending: boolean;
}

/** Step 7: print the report as a PDF, or start again for the next student. */
export default function MonthlyReportFinish({ onNextStudent, onSend, canSend, sending }: Props) {
  return (
    <MonthlyReportCard number={7} title="Finish" hint="Check the report, then generate it for the student">
      <div className={styles.buttons}>
        <button type="button" className={styles.send} onClick={onSend} disabled={!canSend || sending}>{sending ? "Generating..." : "Generate report"}</button>
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
      {!canSend && <p className={styles.note}>To generate the report, choose the registered student in step 1.</p>}
      <p className={styles.note}>
        Generating the report saves it and puts it on the student&rsquo;s dashboard. Download PDF is only for your own copy: choose <strong>Save as PDF</strong> in the print window.
      </p>
    </MonthlyReportCard>
  );
}
