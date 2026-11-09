"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import DiagramPicker from "@/components/tutor/DiagramPicker";
import QuestionLayout from "@/components/ui/QuestionLayout";
import { svgDataUrl } from "@/lib/diagrams";
import { ApiError } from "@/lib/api";
import { LETTERS, MAX_CHOICES, MIN_CHOICES, buildQuizFile, draftProblem, emptyQuestion, type DraftQuestion } from "@/lib/quiz";
import { useToast } from "@/hooks/useToast";
import { updateQuiz, uploadQuiz } from "@/services/quizService";
import styles from "./QuizBuilder.module.css";

/** A saved quiz being edited. */
export interface ExistingQuiz {
  id: number;
  title: string;
  subtitle: string;
  instructions: string;
  questions: DraftQuestion[];
  published: boolean;
  attemptCount: number;
}

/**
 * Make a quiz by hand: type the questions and choices, mark the right answer, and add diagrams. Saves hidden or publishes at once.
 * With `existing`, the same page edits a saved quiz and "Save changes" keeps it published or hidden as it was.
 */
export default function QuizBuilder({ existing }: { existing?: ExistingQuiz }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? "");
  const [instructions, setInstructions] = useState(existing?.instructions ?? "");
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => existing?.questions ?? [emptyQuestion()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (key: number, patch: Partial<DraftQuestion>) => setQuestions((all) => all.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  const remove = (key: number) => setQuestions((all) => (all.length > 1 ? all.filter((q) => q.key !== key) : all));
  const move = (index: number, by: -1 | 1) =>
    setQuestions((all) => {
      const to = index + by;
      if (to < 0 || to >= all.length) return all;
      const next = [...all];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  function setOption(q: DraftQuestion, index: number, text: string) {
    change(q.key, { options: q.options.map((o, i) => (i === index ? text : o)) });
  }
  function addOption(q: DraftQuestion) {
    if (q.options.length < MAX_CHOICES) change(q.key, { options: [...q.options, ""] });
  }
  function removeOption(q: DraftQuestion, index: number) {
    if (q.options.length <= MIN_CHOICES) return;
    // The right answer moves with its choice; removing the right one clears it.
    const correct = q.correct === index ? -1 : q.correct > index ? q.correct - 1 : q.correct;
    change(q.key, { options: q.options.filter((_, i) => i !== index), correct });
  }

  async function save(publish: boolean) {
    if (busy) return;
    const problem = draftProblem(title, questions);
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    try {
      if (existing) {
        const updated = await updateQuiz(existing.id, buildQuizFile({ title, subtitle, instructions }, questions));
        toast.success(`"${updated.title}" is updated.`, { title: "Changes saved" });
        router.push(`/tutor/dashboard/quizzes/${existing.id}`);
        router.refresh();
        return;
      }
      const saved = await uploadQuiz(buildQuizFile({ title, subtitle, instructions }, questions), { draft: !publish });
      toast.success(publish ? `"${saved.title}" is published. Students can take it now.` : `"${saved.title}" is saved hidden. Publish it from the Quizzes page when it is ready.`, { title: publish ? "Quiz published" : "Quiz saved" });
      router.push(`/tutor/dashboard/quizzes/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the quiz. Please try again.");
      setBusy(false);
    }
  }

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  return (
    <div className={styles.page}>
      {existing && existing.attemptCount > 0 && (
        <p className={styles.warn} role="note">
          {existing.attemptCount} attempt{existing.attemptCount === 1 ? "" : "s"} {existing.attemptCount === 1 ? "has" : "have"} already been made. Their saved scores stay exactly as they were, so changing the questions or answers here will not change them.
        </p>
      )}
      <section className={styles.panel} aria-label="Quiz details">
        <h2 className={styles.title}>Quiz details</h2>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Title <span className={styles.star}>*</span></span>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder="e.g. Angles on a straight line" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Subtitle</span>
            <input className={styles.input} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={150} placeholder="e.g. Edexcel GCSE Maths" />
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Instructions for students</span>
          <textarea className={styles.area} value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} maxLength={2000} placeholder="Shown before the quiz starts, e.g. Choose the best answer." />
        </label>
      </section>

      {questions.map((q, index) => (
        <section key={q.key} className={styles.panel} aria-label={`Question ${index + 1}`}>
          <div className={styles.head}>
            <h2 className={styles.title}>Question {index + 1}</h2>
            <div className={styles.tools}>
              <button type="button" className={styles.icon} onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move question ${index + 1} up`}><ArrowUp size={16} aria-hidden="true" /></button>
              <button type="button" className={styles.icon} onClick={() => move(index, 1)} disabled={index === questions.length - 1} aria-label={`Move question ${index + 1} down`}><ArrowDown size={16} aria-hidden="true" /></button>
              <button type="button" className={`${styles.icon} ${styles.danger}`} onClick={() => remove(q.key)} disabled={questions.length === 1} aria-label={`Delete question ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`question-${q.key}`}>Question <span className={styles.star}>*</span></label>
            {/* One box: the text, and the diagram right inside it, wherever it is placed. */}
            <div className={styles.composer}>
              <QuestionLayout
                position={q.position}
                picture={
                  q.svg && (
                    // eslint-disable-next-line @next/next/no-img-element -- an SVG shown as a picture, exactly as students will see it
                    <img src={svgDataUrl(q.svg)} alt={`Diagram for question ${index + 1}`} />
                  )
                }
              >
                <textarea id={`question-${q.key}`} className={styles.composerArea} value={q.question} onChange={(e) => change(q.key, { question: e.target.value })} rows={7} maxLength={1000} placeholder="Type the question" />
              </QuestionLayout>
            </div>
            <DiagramPicker svg={q.svg} onChange={(svg) => change(q.key, { svg, sharedKey: "" })} position={q.position} onPosition={(position) => change(q.key, { position })} />
          </div>

          <div className={styles.field}>
            <span className={styles.label} id={`choices-${q.key}`}>Choices <span className={styles.star}>*</span> <span className={styles.note}>Select the circle beside the correct one.</span></span>
            <div className={styles.choices} role="radiogroup" aria-labelledby={`choices-${q.key}`}>
              {q.options.map((text, i) => (
                <div key={i} className={`${styles.choice} ${q.correct === i ? styles.right : ""}`}>
                  <input type="radio" name={`correct-${q.key}`} checked={q.correct === i} onChange={() => change(q.key, { correct: i })} disabled={!text.trim()} aria-label={`Choice ${LETTERS[i]} is correct`} />
                  <span className={styles.letter}>{LETTERS[i]}</span>
                  <input className={styles.input} value={text} onChange={(e) => setOption(q, i, e.target.value)} maxLength={500} placeholder={`Choice ${LETTERS[i]}`} aria-label={`Choice ${LETTERS[i]}`} />
                  <button type="button" className={styles.icon} onClick={() => removeOption(q, i)} disabled={q.options.length <= MIN_CHOICES} aria-label={`Remove choice ${LETTERS[i]}`}><X size={16} aria-hidden="true" /></button>
                </div>
              ))}
            </div>
            {q.options.length < MAX_CHOICES && (
              <button type="button" className={styles.add} onClick={() => addOption(q)}><Plus size={15} aria-hidden="true" /> Add a choice</button>
            )}
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Marks</span>
              <input className={styles.input} type="number" min={1} max={20} value={q.marks} onChange={(e) => change(q.key, { marks: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Topic</span>
              <input className={styles.input} value={q.topic} onChange={(e) => change(q.key, { topic: e.target.value })} maxLength={150} placeholder="e.g. Angles in a triangle" />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Explanation <span className={styles.note}>Shown to students after they finish.</span></span>
            <textarea className={styles.area} value={q.explanation} onChange={(e) => change(q.key, { explanation: e.target.value })} rows={2} maxLength={3000} placeholder="Why that answer is right" />
          </label>
        </section>
      ))}

      <button type="button" className={styles.addQuestion} onClick={() => setQuestions((all) => [...all, emptyQuestion()])}>
        <Plus size={16} aria-hidden="true" /> Add another question
      </button>

      <div className={styles.bar}>
        <p className={styles.summary}>{questions.length} question{questions.length === 1 ? "" : "s"} · {totalMarks} mark{totalMarks === 1 ? "" : "s"}</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.barActions}>
          <Link href={existing ? `/tutor/dashboard/quizzes/${existing.id}` : "/tutor/dashboard/quizzes"} className={styles.cancel}>Cancel</Link>
          {existing ? (
            <button type="button" className={styles.primary} onClick={() => save(existing.published)} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          ) : (
            <>
              <button type="button" className={styles.secondary} onClick={() => save(false)} disabled={busy}>{busy ? "Saving…" : "Save as hidden"}</button>
              <button type="button" className={styles.primary} onClick={() => save(true)} disabled={busy}>{busy ? "Saving…" : "Publish quiz"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
