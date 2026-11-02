"use client";

import { useState } from "react";
import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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
  const [confirming, setConfirming] = useState(false);
  return (
    <MonthlyReportCard number={7} title="Finish" hint="Check the report, then generate it for the student">
      <div className={styles.buttons}>
        <button type="button" className={styles.send} onClick={onSend} disabled={!canSend || sending}>{sending ? "Generating..." : "Generate report"}</button>
        <button type="button" className={styles.download} onClick={() => window.print()}>Download PDF</button>
        <button
          type="button"
          className={styles.next}
          onClick={() => setConfirming(true)}
        >
          Start next student
        </button>
      </div>
      {!canSend && <p className={styles.note}>To generate the report, choose the registered student in step 1.</p>}
      <p className={styles.note}>
        Generating the report saves it and puts it on the student&rsquo;s dashboard. Download PDF is only for your own copy: choose <strong>Save as PDF</strong> in the print window.
      </p>
      <ConfirmDialog
        open={confirming}
        title="Start a new report?"
        actions={[{ label: "Clear and start again", tone: "danger", onClick: () => { setConfirming(false); onNextStudent(); } }]}
        onClose={() => setConfirming(false)}
      >
        <p>This clears the current student&rsquo;s answers from the form. A report you already generated is not affected.</p>
      </ConfirmDialog>
    </MonthlyReportCard>
  );
}
