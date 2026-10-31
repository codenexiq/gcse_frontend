"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import MathText from "@/components/ui/MathText";
import DiagnosticQuestionForm from "@/components/tutor/DiagnosticQuestionForm";
import DiagnosticQuestionGenerator from "@/components/tutor/DiagnosticQuestionGenerator";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { deleteDiagnosticQuestion } from "@/services/diagnosticQuestionService";
import type { DiagnosticQuestion, DiagnosticTopic, StartupOption } from "@/types";
import styles from "./DiagnosticQuestionBuilder.module.css";

interface Props {
  initialQuestions: DiagnosticQuestion[];
  /** Only the "subject" choices. */
  subjects: StartupOption[];
  /** What the free generator can write. */
  topics: DiagnosticTopic[];
}

/** The tutor's screen for writing, changing and deleting diagnostic questions. */
export default function DiagnosticQuestionBuilder({ initialQuestions, subjects, topics }: Props) {
  const toast = useToast();
  const [questions, setQuestions] = useState(initialQuestions);
  // null = side panel closed, "new" = writing a question by hand, "generate" = the one-click generator, otherwise the question being changed.
  const [editing, setEditing] = useState<DiagnosticQuestion | "new" | "generate" | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.label ?? "Unknown subject";

  async function remove(id: number) {
    try {
      await deleteDiagnosticQuestion(id);
      setQuestions((all) => all.filter((q) => q.id !== id));
      setConfirmId(null);
      toast.success("Question deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function saved(q: DiagnosticQuestion) {
    setQuestions((all) => (all.some((x) => x.id === q.id) ? all.map((x) => (x.id === q.id ? q : x)) : [...all, q]));
    setEditing(null);
  }

  return (
    <div className={`${styles.layout} ${editing ? styles.withForm : ""}`}>
      <section className={styles.panel} aria-label="Diagnostic questions">
        <div className={styles.top}>
          <p className={styles.count}>{questions.length} {questions.length === 1 ? "question" : "questions"}</p>
          <div className={styles.buttons}>
            <button type="button" className={styles.generate} onClick={() => setEditing("generate")} disabled={subjects.length === 0}>
              <Sparkles size={16} aria-hidden="true" /> Generate questions
            </button>
            <button type="button" className={styles.manual} onClick={() => setEditing("new")} disabled={subjects.length === 0}>
              <Plus size={16} aria-hidden="true" /> New question
            </button>
          </div>
        </div>
        {subjects.length === 0 && <p className={styles.empty}>Add a subject on the Student Start-up Screen first.</p>}

        <ul className={styles.list}>
          {questions.map((q) => (
            <li key={q.id} className={styles.item}>
              <div className={styles.body}>
                <p className={styles.meta}>{q.level} &middot; {subjectName(q.subjectId)} &middot; {q.tier === "Any" ? "Any tier" : q.tier} &middot; {q.topic}</p>
                <p className={styles.text}><MathText text={q.question} /></p>
              </div>
              {confirmId === q.id ? (
                <span className={styles.confirm}>
                  Delete?
                  <button type="button" className={styles.danger} onClick={() => remove(q.id)}>Yes, delete</button>
                  <button type="button" className={styles.textBtn} onClick={() => setConfirmId(null)}>Keep</button>
                </span>
              ) : (
                <span className={styles.actions}>
                  <button type="button" className={styles.iconBtn} onClick={() => { setEditing(q); setConfirmId(null); }} aria-label={`Edit question ${q.id}`}><Pencil size={15} aria-hidden="true" /></button>
                  <button type="button" className={styles.iconBtn} onClick={() => setConfirmId(q.id)} aria-label={`Delete question ${q.id}`}><Trash2 size={15} aria-hidden="true" /></button>
                </span>
              )}
            </li>
          ))}
          {questions.length === 0 && subjects.length > 0 && <li className={styles.empty}>No questions yet. Click &ldquo;Generate questions&rdquo; to have them written for you.</li>}
        </ul>
      </section>

      {editing && (
        <div className={styles.side}>
          {editing === "generate" ? (
            <DiagnosticQuestionGenerator
              subjects={subjects}
              topics={topics}
              onGenerated={(qs) => { setQuestions((all) => [...all, ...qs]); setEditing(null); }}
              onClose={() => setEditing(null)}
            />
          ) : (
            <DiagnosticQuestionForm
              key={editing === "new" ? "new" : editing.id}
              question={editing === "new" ? null : editing}
              subjects={subjects}
              onSaved={saved}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
