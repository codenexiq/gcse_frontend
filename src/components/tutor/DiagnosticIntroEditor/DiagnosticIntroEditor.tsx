"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { saveDiagnosticIntro } from "@/services/startupOptionService";
import type { DiagnosticIntroContent } from "@/types";
import styles from "./DiagnosticIntroEditor.module.css";

interface Props {
  /** The wording being edited. The screen on the left shows it live. */
  draft: DiagnosticIntroContent;
  onChange: (draft: DiagnosticIntroContent) => void;
  onSaved: (saved: DiagnosticIntroContent) => void;
  /** Throws away the changes and closes. */
  onCancel: () => void;
}

const TEXT_FIELDS: { key: Exclude<keyof DiagnosticIntroContent, "questions">; label: string; hint?: string; long?: boolean; max: number }[] = [
  { key: "badge", label: "Badge", max: 60 },
  { key: "heading", label: "Heading", hint: "{level} and {subject} are filled in for you.", max: 120 },
  { key: "intro", label: "Intro text", hint: "{questions} becomes the number of questions.", long: true, max: 300 },
  { key: "hint", label: "Hint text", hint: "{highlight} becomes the bold phrase below.", long: true, max: 300 },
  { key: "highlight", label: "Bold phrase", max: 80 },
  { key: "buttonLabel", label: "Button label", max: 40 },
  { key: "nextLabel", label: "Results screen: small label", max: 60 },
  { key: "nextHeading", label: "Results screen: heading", max: 120 },
  { key: "nextText", label: "Results screen: text", long: true, max: 300 },
];

/** Edit the wording of the diagnostic intro screen. */
export default function DiagnosticIntroEditor({ draft, onChange, onSaved, onCancel }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      onSaved(await saveDiagnosticIntro(draft));
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={save} aria-label="Edit diagnostic screen">
      <div className={styles.head}>
        <h3 className={styles.title}>Edit this screen</h3>
        <button type="button" className={styles.close} onClick={onCancel} aria-label="Close without saving">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {TEXT_FIELDS.map((f) => (
        <div key={f.key} className={styles.field}>
          <label htmlFor={`intro-${f.key}`} className={styles.label}>{f.label}</label>
          {f.long ? (
            <textarea id={`intro-${f.key}`} className={styles.input} rows={3} maxLength={f.max} value={draft[f.key]} onChange={(e) => onChange({ ...draft, [f.key]: e.target.value })} />
          ) : (
            <input id={`intro-${f.key}`} className={styles.input} maxLength={f.max} value={draft[f.key]} onChange={(e) => onChange({ ...draft, [f.key]: e.target.value })} />
          )}
          {f.hint && <span className={styles.note}>{f.hint}</span>}
        </div>
      ))}

      <div className={styles.field}>
        <label htmlFor="intro-questions" className={styles.label}>Number of questions</label>
        <input id="intro-questions" type="number" min={1} max={100} className={styles.input} value={draft.questions}
          onChange={(e) => onChange({ ...draft, questions: Number(e.target.value) })} />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.save} disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}
