"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileJson, PencilLine, Upload, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { previewQuizFile } from "@/lib/quiz";
import { useToast } from "@/hooks/useToast";
import { uploadQuiz } from "@/services/quizService";
import styles from "./QuizUpload.module.css";

const MAX_BYTES = 8_000_000;

interface Picked {
  name: string;
  data: unknown;
  title: string;
  questions: number;
  marks: number;
  diagrams: number;
}

const EXAMPLE = `{
  "title": "Angle Problems Challenge",
  "subtitle": "Edexcel GCSE Maths",
  "instructions": "Choose the best answer.",
  "questions": [
    {
      "ref": "Q1", "marks": 1, "topic": "Angles on a straight line",
      "question": "PQ is a straight line. Work out x.",
      "options": { "A": "44°", "B": "54°", "C": "126°", "D": "36°" },
      "correct": "B",
      "explanation": "180 − 126 = 54°."
    }
  ],
  "scoring": { "feedback": [ { "min": 0, "max": 11, "message": "Keep practising!" } ] }
}`;

/** Upload a quiz file: choose or drop a .json file, see what is in it, then upload. Students can take the quiz straight away. */
export default function QuizUpload() {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function pick(file: File | undefined) {
    setError("");
    setPicked(null);
    if (!file) return;
    if (file.size > MAX_BYTES) return setError("That file is over 8 MB. Try fewer or smaller diagrams.");
    if (!/\.json$/i.test(file.name) && file.type !== "application/json") return setError("Choose a .json file.");
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      return setError("That file is not valid JSON. Look for a missing comma, quote or bracket.");
    }
    const preview = previewQuizFile(data);
    if (!preview.ok) return setError(preview.message);
    setPicked({ name: file.name, data, title: preview.title, questions: preview.questions, marks: preview.marks, diagrams: preview.diagrams });
  }

  function clear() {
    setPicked(null);
    setError("");
    if (input.current) input.current.value = "";
  }

  async function upload() {
    if (!picked || busy) return;
    setBusy(true);
    setError("");
    try {
      await uploadQuiz(picked.data);
      toast.success(`"${picked.title}" is uploaded. Students can take it now.`, { title: "Quiz uploaded" });
      clear();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload the quiz. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void pick(event.dataTransfer.files?.[0]);
  }

  return (
    <section className={styles.panel} aria-label="Upload a quiz">
      <div className={styles.top}>
        <div>
          <h2 className={styles.title}>Upload a quiz</h2>
          <p className={styles.text}>Choose a JSON file of multiple-choice questions. Students can take it as soon as it is uploaded, and every score is saved.</p>
        </div>
        <Link href="/tutor/dashboard/quizzes/new" className={styles.create}><PencilLine size={16} aria-hidden="true" /> Create quiz manually</Link>
      </div>

      <div
        className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        <FileJson size={28} aria-hidden="true" />
        <p className={styles.dropText}>Drag a quiz file here, or</p>
        <button type="button" className={styles.choose} onClick={() => input.current?.click()} disabled={busy}>Choose a .json file</button>
        <input ref={input} type="file" accept=".json,application/json" className={styles.hidden} onChange={(e) => void pick(e.target.files?.[0])} aria-label="Quiz file" />
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {picked && (
        <div className={styles.picked}>
          <div className={styles.pickedInfo}>
            <strong className={styles.pickedTitle}>{picked.title}</strong>
            <span className={styles.pickedMeta}>{picked.name} · {picked.questions} question{picked.questions === 1 ? "" : "s"} · {picked.marks} mark{picked.marks === 1 ? "" : "s"}{picked.diagrams > 0 && ` · ${picked.diagrams} diagram${picked.diagrams === 1 ? "" : "s"}`}</span>
          </div>
          <div className={styles.pickedActions}>
            <button type="button" className={styles.upload} onClick={upload} disabled={busy}><Upload size={16} aria-hidden="true" /> {busy ? "Uploading..." : "Upload quiz"}</button>
            <button type="button" className={styles.remove} onClick={clear} disabled={busy} aria-label="Remove the chosen file"><X size={16} aria-hidden="true" /></button>
          </div>
        </div>
      )}

      <details className={styles.help}>
        <summary>What should the file look like?</summary>
        <p className={styles.helpText}>
          One JSON object with a <code>title</code> and a list of <code>questions</code>. Each question needs <code>question</code>, <code>options</code> (letters A to F) and <code>correct</code> (one of those letters).
          Optional: <code>subtitle</code>, <code>instructions</code>, and for each question <code>ref</code>, <code>marks</code>, <code>topic</code>, <code>diagram</code> (a written description) and <code>explanation</code>. The names <code>prompt</code>, <code>correctOption</code> and <code>number</code> work too.
          Optional <code>scoring.feedback</code> sets the message for a range of scores. <strong>Diagrams as SVG:</strong> put the pictures in a top-level <code>diagramSvgs</code> object (for example <code>{'{ "page1": "<svg ...>" }'}</code>) and give a question <code>diagramKey</code> (or <code>diagramSvgKey</code>) with that name. Several questions can share one picture, or a question can hold its own <code>svg</code>. SVGs with scripts, event handlers or links to other sites are refused. Colours and other extra fields in the file are ignored. Up to 200 questions, 30 diagrams of up to 2 MB each, and 8 MB in all.
        </p>
        <pre className={styles.example}>{EXAMPLE}</pre>
      </details>
    </section>
  );
}
