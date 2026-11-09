"use client";

import { useState } from "react";
import JSZip from "jszip";
import { ApiError } from "@/lib/api";
import { TYPE_LABEL } from "@/lib/lessons";
import { aiQuestions, aiRedesign } from "@/services/lessonService";
import type { LessonBlock } from "@/types";
import styles from "./LessonAiTools.module.css";

interface Props {
  topic: string;
  /** The slides of the lesson being edited. */
  slides: { title: string; body: string }[];
  /** Adds blocks to the end of the lesson. */
  onAdd: (blocks: LessonBlock[]) => void;
  /** Puts a check question straight after slide number `after` (1 is the first slide). */
  onInsertQuestions: (questions: { after: number; block: LessonBlock }[]) => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);
const off = (err: unknown) => err instanceof ApiError && err.status === 503;

/** The text of each slide of a .pptx file, one list of lines per slide. */
async function readSlides(file: File): Promise<string[][]> {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => Number(a.match(/(\d+)\.xml$/)![1]) - Number(b.match(/(\d+)\.xml$/)![1]));
  const slides: string[][] = [];
  for (const name of names) {
    const xml = await zip.file(name)!.async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const lines: string[] = [];
    for (const p of Array.from(doc.getElementsByTagNameNS("*", "p"))) {
      const text = Array.from(p.getElementsByTagNameNS("*", "t")).map((t) => t.textContent ?? "").join("").trim();
      if (text) lines.push(text);
    }
    if (lines.length) slides.push(lines);
  }
  return slides;
}

/** AI tools for a lesson, as in the prototype: turn a PowerPoint into slides (redesigned by AI when it is switched on), and add check questions between slides. */
export default function LessonAiTools({ topic, slides, onAdd, onInsertQuestions }: Props) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<{ file: string; blocks: LessonBlock[]; byAi: boolean } | null>(null);

  async function importFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setNote("");
    setPreview(null);
    setBusy("Reading slides...");
    try {
      const read = await readSlides(file);
      if (read.length === 0) throw new Error("We couldn't find any text in that file. Slides that are only pictures can't be read.");
      try {
        setBusy(`Redesigning ${read.length} slides with AI. This can take a minute...`);
        setPreview({ file: file.name, blocks: (await aiRedesign(topic, read)).blocks, byAi: true });
      } catch (err) {
        if (!off(err)) throw err;
        // No AI: each slide comes in as it is.
        setNote("The AI helper is not switched on, so the slides come in as they are.");
        setPreview({ file: file.name, blocks: read.map((l): LessonBlock => ({ id: newId(), type: "slide", title: l[0], body: l.slice(1).join("\n\n") })), byAi: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file couldn't be read. Save it as .pptx and try again.");
    } finally {
      setBusy("");
    }
  }

  async function addQuestions() {
    setError("");
    setNote("");
    if (slides.length === 0) return setError("Add some slides first.");
    setBusy("Writing questions...");
    try {
      const { questions } = await aiQuestions(topic, slides);
      if (questions.length === 0) throw new Error("The AI did not write any questions. Try again.");
      onInsertQuestions(questions);
      setNote(`Added ${questions.length} question${questions.length === 1 ? "" : "s"}. Read them before you publish.`);
    } catch (err) {
      setError(off(err) ? "The AI helper is not switched on yet, so it cannot write questions." : err instanceof Error ? err.message : "The AI could not help just now.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className={styles.card} aria-labelledby="ai-tools">
      <h2 id="ai-tools" className={styles.h2}>AI tools</h2>

      <div className={styles.stack}>
        <strong>Turn a PowerPoint into slides</strong>
        <p className={styles.small}>Upload your slides (.pptx). With the AI helper on, it rewrites them as clear lesson slides and adds questions between them. Without it, each slide comes in as it is.</p>
        <div className={styles.row}>
          <input id="pptx" className={styles.hidden} type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" disabled={Boolean(busy)} onChange={(e) => { void importFile(e.target.files?.[0]); e.target.value = ""; }} />
          <label htmlFor="pptx" className={styles.btn}>Upload PowerPoint</label>
          {busy && <span role="status" className={styles.status}>{busy}</span>}
        </div>
      </div>

      {preview && (
        <div className={styles.preview}>
          <strong>{preview.blocks.length} blocks from {preview.file}{preview.byAi ? " · redesigned by AI" : ""}</strong>
          <ol className={styles.small}>
            {preview.blocks.map((b) => (
              <li key={b.id}><strong>{TYPE_LABEL[b.type]}:</strong> {(b.type === "slide" || b.type === "video" ? b.title : b.question).slice(0, 90)}</li>
            ))}
          </ol>
          <div className={styles.row}>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => { onAdd(preview.blocks); setPreview(null); }}>Add to this lesson</button>
            <button type="button" className={styles.ghost} onClick={() => setPreview(null)}>Discard</button>
          </div>
        </div>
      )}

      <div className={`${styles.stack} ${styles.divider}`}>
        <strong>Add questions between slides</strong>
        <p className={styles.small}>The AI reads each slide and writes a check question to go straight after it.</p>
        <div className={styles.row}>
          <button type="button" className={styles.btn} disabled={Boolean(busy) || slides.length === 0} onClick={() => void addQuestions()}>Add AI questions</button>
        </div>
      </div>

      {note && <p className={styles.small} role="status">{note}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}
