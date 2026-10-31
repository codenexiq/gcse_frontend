"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { generateDiagnosticQuestions } from "@/services/diagnosticQuestionService";
import type { DiagnosticBatch, DiagnosticGenerateInput, DiagnosticLevel, DiagnosticQuestion, DiagnosticTier, DiagnosticTopic, StartupOption } from "@/types";
import styles from "./DiagnosticQuestionGenerator.module.css";

const LEVELS: DiagnosticLevel[] = ["GCSE", "IGCSE / O-level", "A-level"];
const TIERS: { value: DiagnosticTier; label: string }[] = [
  { value: "Any", label: "Any tier" },
  { value: "Foundation", label: "Foundation" },
  { value: "Higher", label: "Higher" },
];

interface Props {
  subjects: StartupOption[];
  /** What the free generator can write. */
  topics: DiagnosticTopic[];
  /** Called with the new set and its questions once they are saved. */
  onGenerated: (batch: DiagnosticBatch, questions: DiagnosticQuestion[]) => void;
  onClose: () => void;
}

/** One button: the free built-in generator writes a set of Maths questions and they are saved. */
export default function DiagnosticQuestionGenerator({ subjects, topics, onGenerated, onClose }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  // The built-in generator only knows Maths.
  const mathsSubjects = subjects.filter((s) => /math/i.test(s.label));
  const [draft, setDraft] = useState<DiagnosticGenerateInput>({ level: "GCSE", subjectId: mathsSubjects[0]?.id ?? 0, tier: "Any", topic: "", count: 10 });
  const set = <K extends keyof DiagnosticGenerateInput>(key: K, value: DiagnosticGenerateInput[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // Only topics that exist for the chosen level and tier. A topic that no longer fits falls back to "all topics".
  const availableTopics = topics.filter((t) => t.levels.includes(draft.level) && (draft.tier === "Any" || t.tiers.includes(draft.tier)));
  const topic = availableTopics.some((t) => t.topic === draft.topic) ? draft.topic : "";

  async function generate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { batch, questions } = await generateDiagnosticQuestions({ ...draft, topic });
      toast.success(`${questions.length} ${questions.length === 1 ? "question" : "questions"} added`);
      onGenerated(batch, questions);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={generate} aria-label="Generate questions" aria-busy={busy}>
      <div className={styles.head}>
        <h3 className={styles.title}>Generate questions</h3>
        <button type="button" className={styles.close} onClick={onClose} disabled={busy} aria-label="Close"><X size={16} aria-hidden="true" /></button>
      </div>
      <p className={styles.intro}>
        Free and instant, no account or key needed. The computer works out every answer itself, so the correct answers are always right.
        The questions are added to the list and you can still edit or delete any of them. Maths only for now.
      </p>

      {mathsSubjects.length === 0 ? (
        <p className={styles.warn}>There is no Maths subject. Add one with the Edit link on the Student Start-up Screen first.</p>
      ) : (
        <>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="gen-level" className={styles.label}>Level</label>
              <select id="gen-level" className={styles.input} value={draft.level} disabled={busy} onChange={(e) => set("level", e.target.value as DiagnosticLevel)}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="gen-subject" className={styles.label}>Subject</label>
              <select id="gen-subject" className={styles.input} value={draft.subjectId} disabled={busy} onChange={(e) => set("subjectId", Number(e.target.value))}>
                {mathsSubjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="gen-tier" className={styles.label}>Tier</label>
              <select id="gen-tier" className={styles.input} value={draft.tier} disabled={busy} onChange={(e) => set("tier", e.target.value as DiagnosticTier)}>
                {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label htmlFor="gen-topic" className={styles.label}>Topic</label>
              <select id="gen-topic" className={styles.input} value={topic} disabled={busy} onChange={(e) => set("topic", e.target.value)}>
                <option value="">All topics</option>
                {availableTopics.map((t) => <option key={t.topic}>{t.topic}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="gen-count" className={styles.label}>How many</label>
              <input id="gen-count" type="number" min={1} max={20} className={styles.input} value={draft.count} disabled={busy} onChange={(e) => set("count", Number(e.target.value))} />
            </div>
          </div>

          <button type="submit" className={styles.go} disabled={busy}>
            <Sparkles size={16} aria-hidden="true" /> {busy ? "Writing questions..." : "Generate questions"}
          </button>
        </>
      )}
    </form>
  );
}
