"use client";

import { useState } from "react";
import { Check, ChevronDown, Pencil, Trash2 } from "lucide-react";
import MathText from "@/components/ui/MathText";
import type { DiagnosticQuestion } from "@/types";
import styles from "./DiagnosticQuestionItem.module.css";

interface Props {
  question: DiagnosticQuestion;
  /** e.g. "Maths" */
  subject: string;
  onEdit: (question: DiagnosticQuestion) => void;
  onDelete: (id: number) => void;
}

/** One question inside a card. Click it to see the answers. */
export default function DiagnosticQuestionItem({ question: q, subject, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={`${styles.item} ${open ? styles.open : ""}`}>
      <div className={styles.row}>
        <button type="button" className={styles.body} aria-expanded={open} aria-controls={`question-${q.id}`} onClick={() => setOpen(!open)}>
          <span className={styles.meta}>{q.level} &middot; {subject} &middot; {q.tier === "Any" ? "Any tier" : q.tier} &middot; {q.topic}</span>
          <span className={styles.text}><MathText text={q.question} /></span>
        </button>
        <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
        {confirming ? (
          <span className={styles.confirm}>
            Delete?
            <button type="button" className={styles.danger} onClick={() => onDelete(q.id)}>Yes, delete</button>
            <button type="button" className={styles.textBtn} onClick={() => setConfirming(false)}>Keep</button>
          </span>
        ) : (
          <span className={styles.actions}>
            <button type="button" className={styles.iconBtn} onClick={() => onEdit(q)} aria-label={`Edit question ${q.id}`}><Pencil size={15} aria-hidden="true" /></button>
            <button type="button" className={styles.iconBtn} onClick={() => setConfirming(true)} aria-label={`Delete question ${q.id}`}><Trash2 size={15} aria-hidden="true" /></button>
          </span>
        )}
      </div>
      {open && (
        <ol id={`question-${q.id}`} className={styles.answers} aria-label="Answers">
          {q.options.map((o, i) => (
            <li key={i} className={`${styles.answer} ${o.isCorrect ? styles.correct : ""}`}>
              <span className={styles.mark} aria-hidden="true">{o.isCorrect ? <Check size={14} /> : String.fromCharCode(65 + i)}</span>
              <span className={styles.answerBody}>
                <span className={styles.answerText}><MathText text={o.text} />{o.isCorrect && <span className={styles.badge}> Correct answer</span>}</span>
                {!o.isCorrect && o.misconception && <span className={styles.why}>Mistake: {o.misconception}</span>}
              </span>
            </li>
          ))}
          <li className={`${styles.answer} ${styles.unknown}`}>
            <span className={styles.mark} aria-hidden="true">?</span>
            <span className={styles.answerBody}><span className={styles.answerText}>I haven&rsquo;t learned this yet</span></span>
          </li>
        </ol>
      )}
    </li>
  );
}
