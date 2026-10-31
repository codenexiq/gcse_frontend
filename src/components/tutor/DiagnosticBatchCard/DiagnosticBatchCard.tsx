"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, PenLine, Sparkles, Trash2 } from "lucide-react";
import styles from "./DiagnosticBatchCard.module.css";

interface Props {
  /** e.g. "GCSE Maths · Higher" */
  title: string;
  /** e.g. "All topics · Generated 31 Oct 2026, 14:05" */
  subtitle: string;
  /** How many questions are inside. Shown when the card is opened. */
  count: number;
  /** Words after the number: "generated" or "written by hand". */
  countLabel: string;
  kind: "generated" | "hand";
  /** Start open (the card that was just made). */
  defaultOpen?: boolean;
  /** Deletes the whole set. Leave out to hide the button. */
  onDeleteSet?: () => void;
  children: ReactNode;
}

/**
 * One plain card for one click of "Generate questions", laid out like the cards on the overview page.
 * Click it to open it: it widens across the row and shows how many questions it made, and the questions.
 */
export default function DiagnosticBatchCard({ title, subtitle, count, countLabel, kind, defaultOpen = false, onDeleteSet, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirming, setConfirming] = useState(false);
  const Icon = kind === "generated" ? Sparkles : PenLine;

  return (
    <article className={`${styles.card} ${open ? styles.open : ""}`}>
      <button type="button" className={styles.head} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={styles.top}>
          <span className={styles.icon}><Icon size={20} aria-hidden="true" /></span>
          <ChevronDown size={18} aria-hidden="true" className={styles.chevron} />
        </span>
        <span className={styles.label}>{kind === "generated" ? "Generated set" : "Your questions"}</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle} suppressHydrationWarning>{subtitle}</span>
        <span className={styles.hint}>{open ? "Close" : "Open"} <span aria-hidden="true">{open ? "↑" : "→"}</span></span>
      </button>

      {open && (
        <div className={styles.content}>
          <div className={styles.summary}>
            <p className={styles.count}><strong>{count}</strong> {count === 1 ? "question" : "questions"} {countLabel}</p>
            {onDeleteSet &&
              (confirming ? (
                <span className={styles.confirm}>
                  Delete this set and its {count} {count === 1 ? "question" : "questions"}?
                  <button type="button" className={styles.danger} onClick={onDeleteSet}>Yes, delete</button>
                  <button type="button" className={styles.textBtn} onClick={() => setConfirming(false)}>Keep</button>
                </span>
              ) : (
                <button type="button" className={styles.deleteSet} onClick={() => setConfirming(true)}>
                  <Trash2 size={14} aria-hidden="true" /> Delete this set
                </button>
              ))}
          </div>
          <ul className={styles.list}>{children}</ul>
        </div>
      )}
    </article>
  );
}
