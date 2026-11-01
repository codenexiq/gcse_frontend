"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import DiagnosticBatchCard from "@/components/tutor/DiagnosticBatchCard";
import DiagnosticQuestionForm from "@/components/tutor/DiagnosticQuestionForm";
import DiagnosticQuestionGenerator from "@/components/tutor/DiagnosticQuestionGenerator";
import DiagnosticQuestionItem from "@/components/tutor/DiagnosticQuestionItem";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { deleteDiagnosticBatch, deleteDiagnosticQuestion } from "@/services/diagnosticQuestionService";
import type { DiagnosticBatch, DiagnosticQuestion, DiagnosticTopic, StartupOption } from "@/types";
import styles from "./DiagnosticQuestionBuilder.module.css";

interface Props {
  initialQuestions: DiagnosticQuestion[];
  /** The sets made by "Generate questions", newest first. */
  initialBatches: DiagnosticBatch[];
  /** Only the "subject" choices. */
  subjects: StartupOption[];
  /** What the free generator can write. */
  topics: DiagnosticTopic[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The tutor's screen for the diagnostic questions: one card for every click of "Generate questions". */
export default function DiagnosticQuestionBuilder({ initialQuestions, initialBatches, subjects, topics }: Props) {
  const toast = useToast();
  const [questions, setQuestions] = useState(initialQuestions);
  const [batches, setBatches] = useState(initialBatches);
  // null = side panel closed, "new" = writing a question by hand, "generate" = the one-click generator, otherwise the question being changed.
  const [editing, setEditing] = useState<DiagnosticQuestion | "new" | "generate" | null>(null);
  // The set that was just made starts open.
  const [freshBatchId, setFreshBatchId] = useState<number | null>(null);

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.label ?? "Unknown subject";
  const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");

  async function removeQuestion(id: number) {
    try {
      await deleteDiagnosticQuestion(id);
      setQuestions((all) => all.filter((q) => q.id !== id));
      toast.success("Question deleted");
    } catch (err) {
      fail(err);
    }
  }

  async function removeBatch(id: number) {
    try {
      await deleteDiagnosticBatch(id);
      setQuestions((all) => all.filter((q) => q.batchId !== id));
      setBatches((all) => all.filter((b) => b.id !== id));
      toast.success("Set deleted");
    } catch (err) {
      fail(err);
    }
  }

  function saved(q: DiagnosticQuestion) {
    setQuestions((all) => (all.some((x) => x.id === q.id) ? all.map((x) => (x.id === q.id ? q : x)) : [...all, q]));
    setEditing(null);
  }

  const renderQuestions = (list: DiagnosticQuestion[]) =>
    list.map((q) => <DiagnosticQuestionItem key={q.id} question={q} subject={subjectName(q.subjectId)} onEdit={setEditing} onDelete={removeQuestion} />);

  // Sets with nothing left in them (every question deleted one by one) are not shown.
  const shownBatches = batches.map((b) => ({ batch: b, items: questions.filter((q) => q.batchId === b.id) })).filter((x) => x.items.length > 0);
  const byHand = questions.filter((q) => q.batchId === null);

  // Writing or changing one question takes the whole page; the list comes back when it is saved or cancelled.
  if (editing && editing !== "generate") {
    return (
      <div className={styles.full}>
        <button type="button" className={styles.back} onClick={() => setEditing(null)}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to questions
        </button>
        <DiagnosticQuestionForm
          key={editing === "new" ? "new" : editing.id}
          question={editing === "new" ? null : editing}
          subjects={subjects}
          onSaved={saved}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.layout} ${editing ? styles.withForm : ""}`}>
      <section className={styles.main} aria-label="Diagnostic questions">
        <div className={styles.top}>
          <p className={styles.count}>{questions.length} {questions.length === 1 ? "question" : "questions"} in total</p>
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

        <div className={styles.cards}>
          {shownBatches.map(({ batch, items }) => (
            <DiagnosticBatchCard
              key={batch.id}
              kind="generated"
              title={`${batch.level} ${subjectName(batch.subjectId)}${batch.tier === "Any" ? "" : ` · ${batch.tier}`}`}
              subtitle={`${batch.topic ?? "All topics"} · Generated ${formatDate(batch.createdAt)}`}
              count={items.length}
              countLabel="generated"
              defaultOpen={batch.id === freshBatchId}
              onDeleteSet={() => removeBatch(batch.id)}
            >
              {renderQuestions(items)}
            </DiagnosticBatchCard>
          ))}
          {byHand.length > 0 && (
            <DiagnosticBatchCard key="by-hand" kind="hand" title="Written by hand" subtitle="Questions you wrote yourself, and earlier questions" count={byHand.length} countLabel="written by hand">
              {renderQuestions(byHand)}
            </DiagnosticBatchCard>
          )}
          {questions.length === 0 && subjects.length > 0 && <p className={styles.empty}>No questions yet. Click &ldquo;Generate questions&rdquo; to have them written for you.</p>}
        </div>
      </section>

      {editing && (
        <div className={styles.side}>
          <DiagnosticQuestionGenerator
            subjects={subjects}
            topics={topics}
            onGenerated={(batch, made) => {
              setBatches((all) => [batch, ...all]);
              setQuestions((all) => [...all, ...made]);
              setFreshBatchId(batch.id);
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}
