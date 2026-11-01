"use client";

import { useRef, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import MathKeyboard, { insertMath } from "@/components/ui/MathKeyboard";
import MathText from "@/components/ui/MathText";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { addDiagnosticQuestion, changeDiagnosticQuestion } from "@/services/diagnosticQuestionService";
import type { DiagnosticLevel, DiagnosticQuestion, DiagnosticQuestionInput, DiagnosticTier, StartupOption } from "@/types";
import styles from "./DiagnosticQuestionForm.module.css";

const LEVELS: DiagnosticLevel[] = ["GCSE", "IGCSE / O-level", "A-level"];
const TIERS: { value: DiagnosticTier; label: string }[] = [
  { value: "Any", label: "Any tier" },
  { value: "Foundation", label: "Foundation" },
  { value: "Higher", label: "Higher" },
];

interface Props {
  /** The question being changed, or null for a new one. */
  question: DiagnosticQuestion | null;
  subjects: StartupOption[];
  onSaved: (saved: DiagnosticQuestion) => void;
  onCancel: () => void;
}

/** Write a new diagnostic question, or change an existing one. */
export default function DiagnosticQuestionForm({ question, subjects, onSaved, onCancel }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const questionBox = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState<DiagnosticQuestionInput>(
    question ?? {
      level: "GCSE",
      subjectId: subjects[0]?.id ?? 0,
      tier: "Any",
      topic: "",
      question: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    }
  );

  const set = <K extends keyof DiagnosticQuestionInput>(key: K, value: DiagnosticQuestionInput[K]) => setDraft((d) => ({ ...d, [key]: value }));
  /** Adds a key from the maths keyboard at the caret in the question box. */
  function typeMaths(latex: string) {
    const box = questionBox.current;
    const start = box?.selectionStart ?? draft.question.length;
    const end = box?.selectionEnd ?? draft.question.length;
    const next = insertMath(draft.question, start, end, latex);
    if (next.text.length > 500) return;
    set("question", next.text);
    requestAnimationFrame(() => {
      box?.focus();
      box?.setSelectionRange(next.caret, next.caret);
    });
  }
  const setOptionText = (i: number, text: string) => set("options", draft.options.map((o, n) => (n === i ? { ...o, text } : o)));
  const setMisconception = (i: number, misconception: string) => set("options", draft.options.map((o, n) => (n === i ? { ...o, misconception } : o)));
  const setCorrect = (i: number) => set("options", draft.options.map((o, n) => ({ ...o, isCorrect: n === i })));
  const removeOption = (i: number) => {
    const rest = draft.options.filter((_, n) => n !== i);
    // If the correct answer was removed, the first one becomes correct.
    set("options", rest.some((o) => o.isCorrect) ? rest : rest.map((o, n) => ({ ...o, isCorrect: n === 0 })));
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = question ? await changeDiagnosticQuestion(question.id, draft) : await addDiagnosticQuestion(draft);
      toast.success(question ? "Question saved" : "Question added");
      onSaved(saved);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={save} aria-label={question ? "Edit question" : "New question"}>
      <div className={styles.head}>
        <h3 className={styles.title}>{question ? "Edit question" : "New question"}</h3>
        <button type="button" className={styles.iconBtn} onClick={onCancel} aria-label="Close without saving"><X size={16} aria-hidden="true" /></button>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="dq-level" className={styles.label}>Level</label>
          <select id="dq-level" className={styles.input} value={draft.level} onChange={(e) => set("level", e.target.value as DiagnosticLevel)}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="dq-subject" className={styles.label}>Subject</label>
          <select id="dq-subject" className={styles.input} value={draft.subjectId} onChange={(e) => set("subjectId", Number(e.target.value))}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="dq-tier" className={styles.label}>Tier</label>
          <select id="dq-tier" className={styles.input} value={draft.tier} onChange={(e) => set("tier", e.target.value as DiagnosticTier)}>
            {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="dq-topic" className={styles.label}>Topic</label>
        <input id="dq-topic" className={styles.input} maxLength={60} placeholder="e.g. Fractions" value={draft.topic} onChange={(e) => set("topic", e.target.value)} />
      </div>

      <div className={styles.field}>
        <label htmlFor="dq-question" className={styles.label}>Question</label>
        <textarea id="dq-question" ref={questionBox} className={styles.input} rows={3} maxLength={500} value={draft.question} onChange={(e) => set("question", e.target.value)} />
        <MathKeyboard onInsert={typeMaths} />
        <span className={styles.note}>Write maths between dollar signs, e.g. Work out $\frac{"{3}{4}"} + \frac{"{1}{6}"}$</span>
        {draft.question && <p className={styles.preview}><MathText text={draft.question} /></p>}
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.label}>Answers (pick the correct one)</legend>
        {draft.options.map((o, i) => (
          <div key={i} className={styles.answerBlock}>
          <div className={styles.answer}>
            <input type="radio" name="correct" checked={o.isCorrect} onChange={() => setCorrect(i)} aria-label={`Answer ${i + 1} is correct`} />
            <input className={styles.input} maxLength={200} value={o.text} onChange={(e) => setOptionText(i, e.target.value)} aria-label={`Answer ${i + 1}`} placeholder={`Answer ${i + 1}`} />
            <span className={styles.answerPreview}>{o.text && <MathText text={o.text} />}</span>
            {draft.options.length > 2 && (
              <button type="button" className={styles.iconBtn} onClick={() => removeOption(i)} aria-label={`Remove answer ${i + 1}`}><X size={14} aria-hidden="true" /></button>
            )}
          </div>
          {!o.isCorrect && (
            <input className={styles.why} maxLength={100} value={o.misconception ?? ""} onChange={(e) => setMisconception(i, e.target.value)} aria-label={`Mistake answer ${i + 1} shows`} placeholder="Mistake this shows, e.g. adding instead of multiplying (optional)" />
          )}
          </div>
        ))}
        {draft.options.length < 6 && (
          <button type="button" className={styles.addAnswer} onClick={() => set("options", [...draft.options, { text: "", isCorrect: false }])}>
            <Plus size={14} aria-hidden="true" /> Add an answer
          </button>
        )}
        <span className={styles.note}>&ldquo;I haven&rsquo;t learned this yet&rdquo; is added to every question automatically.</span>
      </fieldset>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.save} disabled={busy}>{busy ? "Saving..." : "Save question"}</button>
      </div>
    </form>
  );
}
