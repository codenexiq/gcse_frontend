import { Pencil } from "lucide-react";
import { fillTemplate } from "@/utils/fillTemplate";
import type { DiagnosticIntroContent } from "@/types";
import styles from "./DiagnosticIntroCard.module.css";

interface Props {
  content: DiagnosticIntroContent;
  level: string;
  subject: string;
  /** Opens the editor (tutors only). */
  onEdit: () => void;
  /** The diagnostic itself is not built yet. */
  onStart: () => void;
}

/** The "Your GCSE Maths diagnostic" card. */
export default function DiagnosticIntroCard({ content, level, subject, onEdit, onStart }: Props) {
  const values = { level, subject, questions: content.questions };
  // The hint can contain {highlight}, which is shown in bold.
  const [beforeHint, afterHint] = fillTemplate(content.hint, values).split("{highlight}");

  return (
    <section className={styles.card} aria-label="Diagnostic introduction">
      <button type="button" className={styles.edit} onClick={onEdit} aria-label="Edit this screen">
        <Pencil size={14} aria-hidden="true" /> Edit
      </button>
      <span className={styles.badge}>{content.badge}</span>
      <h2 className={styles.heading}>{fillTemplate(content.heading, values)}</h2>
      <p className={styles.intro}>{fillTemplate(content.intro, values)}</p>
      <p className={styles.hint}>
        {beforeHint}
        {afterHint !== undefined && <strong className={styles.highlight}>{content.highlight}</strong>}
        {afterHint}
      </p>
      <button type="button" className={styles.start} onClick={onStart}>{content.buttonLabel}</button>
    </section>
  );
}
