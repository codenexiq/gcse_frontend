"use client";

import { useState } from "react";
import QuizMaker from "@/components/tutor/QuizMaker";
import { ApiError } from "@/lib/api";
import { newBlock, toBase64 } from "@/lib/lessons";
import { aiPdf, createLesson, saveLesson } from "@/services/lessonService";
import type { LessonBlock, LessonStrand, TutorLesson } from "@/types";
import styles from "./LessonAddCard.module.css";

interface Props {
  topic: string;
  strands: LessonStrand[];
  /** Called with the new lesson (saved, hidden from students) so the builder can open it. */
  onCreated: (lesson: TutorLesson, note: string) => void;
}

const MAX_PDF = 7 * 1024 * 1024;

/** "Add to <topic>" (prototype): create a quiz, make a quiz from a PDF, turn a PDF into notes, or write notes. New lessons start hidden from students. */
export default function LessonAddCard({ topic, strands, onCreated }: Props) {
  const [maker, setMaker] = useState<"ai" | "pdf" | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function makeLesson(title: string, blocks: LessonBlock[]) {
    const made = await createLesson(topic, title);
    return saveLesson(made.id, { title, published: false, blocks });
  }

  async function writeNotes() {
    setError("");
    setBusy("Starting notes...");
    try {
      onCreated(await makeLesson(`Notes: ${topic}`, [newBlock("slide")]), "Add your notes on the slide below, then tick Visible to students.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the notes.");
    } finally {
      setBusy("");
    }
  }

  async function pdfToNotes(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > MAX_PDF) return setError("That PDF is over 7 MB. Try a shorter one.");
    setBusy("Reading the PDF and writing notes. This can take a minute...");
    try {
      const { blocks } = await aiPdf({ topic, mode: "notes", pdf: await toBase64(file) });
      onCreated(await makeLesson(`Notes: ${topic}`, blocks), `${blocks.length} slide${blocks.length === 1 ? "" : "s"} made from your PDF. Read them, then tick Visible to students.`);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 503 ? "The AI helper is not switched on yet, so it cannot read PDFs. You can still write the notes yourself." : err instanceof Error ? err.message : "That PDF could not be used.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <section className={styles.card} aria-labelledby="add-to">
        <div>
          <h3 id="add-to" className={styles.h3}>Add to {topic}</h3>
          <p className={styles.small}>Create a quiz in a few minutes, or upload your own PDF worksheet or notes.</p>
        </div>
        <div className={styles.row}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => setMaker("ai")}>+ Create a quiz</button>
          <button type="button" className={styles.btn} onClick={() => setMaker("pdf")}>Quiz from a PDF</button>
          <input id="pdf-notes" className={styles.hidden} type="file" accept="application/pdf,.pdf" disabled={Boolean(busy)} onChange={(e) => { void pdfToNotes(e.target.files?.[0]); e.target.value = ""; }} />
          <label htmlFor="pdf-notes" className={styles.btn}>Upload PDF &rarr; notes</label>
          <button type="button" className={styles.btn} disabled={Boolean(busy)} onClick={() => void writeNotes()}>+ Write notes</button>
          {busy && <span role="status" className={styles.small}>{busy}</span>}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
      {maker && (
        <QuizMaker
          topic={topic}
          strands={strands}
          startMode={maker}
          makeLesson={makeLesson}
          onClose={() => setMaker(null)}
          onCreated={(lesson, note) => {
            setMaker(null);
            onCreated(lesson, note);
          }}
        />
      )}
    </>
  );
}
