"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CircleHelp, PenLine, Play } from "lucide-react";
import MathText from "@/components/ui/MathText";
import { KEYS, safeLink, toMathLines } from "@/lib/lessons";
import { ApiError } from "@/lib/api";
import RichText from "@/components/lessons/RichText";
import { aiMark, askGenie, checkAnswer, checkPracticeAnswer, finishLesson, finishPractice, markScheme, startPractice } from "@/services/lessonService";
import type { LessonBlock, LessonOutcome, StudentLesson, TutorLesson } from "@/types";
import styles from "./LessonPlayer.module.css";

interface Props {
  lesson: StudentLesson | TutorLesson;
  /** A tutor trying the lesson: marked here in the browser, nothing is saved. */
  preview?: boolean;
  /** Where Close and "Back to my learning map" lead. */
  closeHref: string;
  closeLabel: string;
  /** A fresh practice set (multiple choice only) instead of a tutor's lesson. */
  practice?: boolean;
}

type Checked = { correct: boolean; correctIndex: number; explain: string };

const ICONS = { slide: BookOpen, video: Play, mcq: CircleHelp, written: PenLine };
const KINDS = { slide: "slideColor", video: "videoColor", mcq: "quizColor", written: "writtenColor" } as const;
const ORDINAL = "ABCD";

/** The lesson player, as in the prototype: one block at a time, a progress bar, Back and Continue, then the score. */
export default function LessonPlayer({ lesson, preview = false, closeHref, closeLabel, practice = false }: Props) {
  const router = useRouter();
  const blocks = lesson.blocks as (StudentLesson["blocks"][number] | LessonBlock)[];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, Checked>>({});
  const [text, setText] = useState<Record<string, string>>({});
  const [scheme, setScheme] = useState<Record<string, { markScheme: string; marks: number }>>({});
  const [selfMarks, setSelfMarks] = useState<Record<string, number>>({});
  const [outcome, setOutcome] = useState<LessonOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(Date.now());
  // AI marking of written answers (what the AI said about each), Genie, and a note when new practice questions fail.
  const [aiResult, setAiResult] = useState<Record<string, { marks: number; feedback: string }>>({});
  const [genieOpen, setGenieOpen] = useState(false);
  const [genieQuestion, setGenieQuestion] = useState("");
  const [genieAnswer, setGenieAnswer] = useState("");
  const [genieBusy, setGenieBusy] = useState(false);
  const [practiceNote, setPracticeNote] = useState("");

  const block = blocks[index];
  const last = index === blocks.length - 1;
  const percent = outcome ? 100 : Math.round(((index + 1) / blocks.length) * 100);

  const canContinue = !block ? false : block.type === "mcq" ? picked[block.id] !== undefined : block.type === "written" ? selfMarks[block.id] !== undefined : true;

  /** In a preview the tutor's own copy holds the answers, so it is marked here. Students are marked by the server. */
  async function mcq(b: Extract<typeof block, { type: "mcq" }>, choice: number) {
    setError("");
    setPicked((p) => ({ ...p, [b.id]: choice }));
    try {
      if (preview) {
        const full = (lesson as TutorLesson).blocks.find((x) => x.id === b.id) as Extract<LessonBlock, { type: "mcq" }>;
        setChecked((c) => ({ ...c, [b.id]: { correct: choice === full.correct, correctIndex: full.correct, explain: full.explain } }));
      } else {
        const result = practice ? await checkPracticeAnswer(lesson.id, b.id, choice) : await checkAnswer(lesson.id, b.id, choice);
        setChecked((c) => ({ ...c, [b.id]: result }));
      }
    } catch (err) {
      setPicked((p) => {
        const next = { ...p };
        delete next[b.id];
        return next;
      });
      setError(err instanceof Error ? err.message : "Could not check that answer.");
    }
  }

  async function showScheme(b: Extract<typeof block, { type: "written" }>) {
    setError("");
    if (!(text[b.id] ?? "").trim()) return setError("Write an answer first.");
    setBusy(true);
    try {
      if (preview) {
        const full = (lesson as TutorLesson).blocks.find((x) => x.id === b.id) as Extract<LessonBlock, { type: "written" }>;
        setScheme((s) => ({ ...s, [b.id]: { markScheme: full.markScheme, marks: full.marks } }));
      } else {
        try {
          // The AI marks it against the tutor's mark scheme.
          const result = await aiMark(lesson.id, b.id, text[b.id]);
          setAiResult((r) => ({ ...r, [b.id]: result }));
          setSelfMarks((m) => ({ ...m, [b.id]: result.marks }));
          setScheme((s) => ({ ...s, [b.id]: { markScheme: "", marks: b.marks } }));
        } catch (err) {
          // Without the AI (not switched on, busy or over the hourly limit) the student marks it against the mark scheme.
          if (!(err instanceof ApiError) || ![429, 502, 503].includes(err.status)) throw err;
          const result = await markScheme(lesson.id, b.id);
          setScheme((s) => ({ ...s, [b.id]: result }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the mark scheme.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setError("");
    try {
      if (preview) {
        const rows: LessonOutcome["rows"] = [];
        for (const b of (lesson as TutorLesson).blocks) {
          if (b.type === "mcq") rows.push({ id: b.id, question: b.question, max: 1, got: picked[b.id] === b.correct ? 1 : 0 });
          if (b.type === "written") rows.push({ id: b.id, question: b.question, max: b.marks, got: Math.min(b.marks, selfMarks[b.id] ?? 0) });
        }
        const got = rows.reduce((a, r) => a + r.got, 0);
        const max = rows.reduce((a, r) => a + r.max, 0);
        const pct = max ? Math.round((got / max) * 100) : 100;
        setOutcome({ got, max, percent: pct, mastered: max > 0 && pct >= 70, rows });
      } else {
        const minutes = Math.min(120, Math.max(1, Math.round((Date.now() - started.current) / 60000)));
        const body = { answers: picked, written: selfMarks, minutes };
        setOutcome(practice ? await finishPractice(lesson.id, body) : await finishLesson(lesson.id, body));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your score. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function newQuestions() {
    setBusy(true);
    setPracticeNote("");
    try {
      const made = await startPractice(lesson.topic);
      router.push(`/student/learning-map/practice/${made.id}`);
    } catch (err) {
      setPracticeNote(err instanceof ApiError && err.status === 503 ? "Fresh practice questions are not switched on yet. Try the lesson again, or ask your tutor." : err instanceof Error ? err.message : "Could not make new questions.");
      setBusy(false);
    }
  }

  async function ask() {
    if (!block) return;
    const q = genieQuestion.trim();
    if (!q) return setError("Type your question first.");
    setError("");
    setGenieBusy(true);
    setGenieAnswer("");
    try {
      const answered = block.type === "mcq" ? checked[block.id] !== undefined : block.type === "written" ? selfMarks[block.id] !== undefined : true;
      setGenieAnswer((await askGenie(lesson.id, block.id, q, answered)).answer);
    } catch (err) {
      setGenieAnswer(err instanceof ApiError && err.status === 503 ? "Genie is not switched on yet, so it cannot answer here. You can message your tutor from the Messages page instead." : err instanceof Error ? err.message : "Genie could not answer just now.");
    } finally {
      setGenieBusy(false);
    }
  }

  function again() {
    setIndex(0);
    setPicked({});
    setChecked({});
    setText({});
    setScheme({});
    setSelfMarks({});
    setOutcome(null);
    setAiResult({});
    setGenieOpen(false);
    setGenieAnswer("");
    started.current = Date.now();
  }

  function addKey(id: string, key: string) {
    setText((t) => ({ ...t, [id]: (t[id] ?? "") + key }));
  }

  if (!block) return <p className={styles.muted}>This lesson has nothing in it yet.</p>;

  const top = (
    <>
      <div className={styles.top}>
        <span className={styles.crumb}>
          {lesson.topic} &middot; {lesson.title}
          {!outcome && ` · ${index + 1} of ${blocks.length}`}
          {preview && " · Teacher preview"}
        </span>
        <Link href={closeHref} className={styles.ghost}>Close</Link>
      </div>
      <div className={styles.pbar} role="progressbar" aria-label="Lesson progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${percent}%` }} />
      </div>
    </>
  );

  if (outcome) {
    return (
      <div className={styles.player}>
        {top}
        <div className={styles.done}>
          {outcome.max === 0 ? (
            <div className={styles.result}>
              <span className={styles.label}>Lesson complete</span>
              <h1>Nice work</h1>
              <p>This lesson had no questions, so your score is not counted.</p>
              <div className={styles.row}>
                <Link href={closeHref} className={`${styles.btn} ${styles.go}`}>{closeLabel}</Link>
              </div>
            </div>
          ) : (
            <>
              <div className={`${styles.result} ${outcome.mastered ? styles.ok : styles.no}`}>
                <span className={styles.label}>Lesson complete &middot; {lesson.topic}</span>
                <div className={styles.score}>
                  <span className={styles.big}>{outcome.percent}%</span>
                  <strong>{outcome.got} out of {outcome.max} marks</strong>
                </div>
                <div className={styles.goal} aria-hidden="true">
                  <div className={styles.goalBar}><i style={{ width: `${outcome.percent}%` }} /></div>
                  <span className={styles.goalMark} style={{ left: "70%" }}><span>70% to master</span></span>
                </div>
                <h1>{outcome.mastered ? `You've mastered ${lesson.topic}!` : "Still needs work"}</h1>
                <p>
                  {outcome.mastered ? `${lesson.topic} is now marked as mastered on your learning map.` : `You need 70% to master ${lesson.topic}. Here is a fresh set of questions on the same topic to try next.`}
                  {preview ? " (Teacher preview: nothing was saved.)" : " Your tutor can see your score."}
                </p>
                {practiceNote && <p role="status" className={styles.small}>{practiceNote}</p>}
                <div className={styles.row}>
                  {outcome.mastered ? (
                    <Link href={closeHref} className={`${styles.btn} ${styles.go}`}>{closeLabel}</Link>
                  ) : (
                    <>
                      {!preview && <button type="button" className={`${styles.btn} ${styles.go}`} disabled={busy} onClick={() => void newQuestions()}>{busy ? "Making new questions..." : "Try new questions"}</button>}
                      {!practice && <button type="button" className={`${styles.btn} ${preview ? styles.go : ""}`} onClick={again}>Try the lesson again</button>}
                      <Link href={closeHref} className={styles.btn}>{closeLabel}</Link>
                    </>
                  )}
                </div>
              </div>
              <section className={styles.answers}>
                <h2>Your answers</h2>
                <ol>
                  {outcome.rows.map((r, i) => (
                    <li key={r.id}>
                      <span>{i + 1}. <MathText text={r.question} /></span>
                      <span className={`${styles.chip} ${r.got >= r.max ? styles.navy : r.got > 0 ? styles.blue : styles.pink}`}>{r.got}/{r.max}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
      </div>
    );
  }

  const Icon = ICONS[block.type];
  const heading =
    block.type === "slide" ? block.title || "Slide" : block.type === "video" ? block.title || "Video" : block.type === "mcq" ? "Multiple Choice Question" : "Written Question";

  return (
    <div className={styles.player}>
      {top}
      <div className={styles.body}>
        <div className={styles.blkHead}>
          <span className={`${styles.icon} ${styles[block.type]}`}><Icon size={22} aria-hidden="true" /></span>
          <h1 className={styles[KINDS[block.type]]}>{block.type === "slide" || block.type === "video" ? <MathText text={heading} /> : heading}</h1>
        </div>

        {block.type === "slide" && <RichText text={block.body} />}

        {block.type === "video" && (
          <>
            <div className={styles.videoBox}>
              {safeLink(block.url) ? (
                <>
                  <a className={`${styles.btn} ${styles.go}`} href={safeLink(block.url)} target="_blank" rel="noopener noreferrer">Watch the video</a>
                  <span className={styles.small}>Opens in a new tab</span>
                </>
              ) : (
                <strong>Video lesson</strong>
              )}
            </div>
            <RichText text={block.note} />
          </>
        )}

        {block.type === "mcq" && (
          <>
            <p className={styles.q}><MathText text={block.question} /></p>
            <div role="group" aria-label="Answers">
              {block.options.map((o, k) => {
                if (!o.trim()) return null;
                const result = checked[block.id];
                const cls = result ? (k === result.correctIndex ? styles.right : k === picked[block.id] ? styles.wrong : "") : "";
                return (
                  <button key={k} type="button" className={`${styles.optbtn} ${cls}`} disabled={picked[block.id] !== undefined} aria-pressed={picked[block.id] === k} onClick={() => void mcq(block, k)}>
                    <span className={styles.letter}>{ORDINAL[k]}</span>
                    <span><MathText text={o} /></span>
                  </button>
                );
              })}
            </div>
            {checked[block.id] && (
              <div className={`${styles.fb} ${checked[block.id].correct ? styles.fbOk : styles.fbNo}`} role="status">
                <strong>{checked[block.id].correct ? "Correct! " : "Not quite. "}</strong>
                <MathText text={checked[block.id].explain} />
              </div>
            )}
          </>
        )}

        {block.type === "written" && (
          <>
            <p className={styles.q}>
              <MathText text={block.question} /> <span className={`${styles.chip} ${styles.lav}`}>{block.marks} mark{block.marks === 1 ? "" : "s"}</span>
            </p>
            <label className={styles.field}>
              <span>Your answer <span className={styles.hint}>Use the maths keyboard for symbols. Type ^ for powers, e.g. x^2.</span></span>
              <textarea rows={4} value={text[block.id] ?? ""} readOnly={Boolean(scheme[block.id])} placeholder="Write your answer and show your working" onChange={(e) => setText((t) => ({ ...t, [block.id]: e.target.value }))} />
            </label>
            {!scheme[block.id] && (
              <div className={styles.keypad} role="group" aria-label="Maths keyboard">
                {KEYS.map(([label, key]) => <button key={label} type="button" className={styles.key} aria-label={`Insert ${label}`} onClick={() => addKey(block.id, key)}>{label}</button>)}
              </div>
            )}
            <div className={styles.preview}>
              <span className={styles.label}>How your answer reads</span>
              <div className={styles.tex}>
                {(text[block.id] ?? "").trim() ? toMathLines(text[block.id]).map((l, i) => <div key={i}><MathText text={l} /></div>) : <span className={styles.small}>Your working appears here as maths.</span>}
              </div>
            </div>
            {!scheme[block.id] ? (
              <div className={styles.row}>
                <button type="button" className={`${styles.btn} ${styles.go}`} disabled={busy} onClick={() => void showScheme(block)}>{busy ? "Loading..." : "Check my answer"}</button>
              </div>
            ) : aiResult[block.id] ? (
              <div className={`${styles.fb} ${aiResult[block.id].marks >= block.marks ? styles.fbOk : styles.fbNo}`} role="status">
                <strong>{aiResult[block.id].marks} out of {block.marks} &middot; marked by AI. </strong>
                <MathText text={aiResult[block.id].feedback} />
              </div>
            ) : (
              <div className={`${styles.fb} ${styles.fbNo}`} role="status">
                <strong>Mark scheme</strong>
                <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 10px" }}><MathText text={scheme[block.id].markScheme || "No mark scheme was written for this question."} /></p>
                <span className={styles.label}>How many marks did you earn?</span>
                <div className={styles.marks}>
                  {Array.from({ length: block.marks + 1 }, (_, n) => (
                    <button key={n} type="button" className={`${styles.mark} ${selfMarks[block.id] === n ? styles.markOn : ""}`} aria-pressed={selfMarks[block.id] === n} onClick={() => setSelfMarks((m) => ({ ...m, [block.id]: n }))}>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}

        {genieOpen && !practice && !preview && (
          <section className={styles.genie} aria-labelledby="genie-h">
            <div className={`${styles.row} ${styles.between}`} style={{ marginTop: 0 }}>
              <h2 id="genie-h" className={styles.genieTitle}>Ask Genie</h2>
              <button type="button" className={styles.ghost} onClick={() => setGenieOpen(false)}>Close</button>
            </div>
            <label className={styles.field}>
              What are you stuck on?
              <textarea rows={2} value={genieQuestion} placeholder="e.g. Why do we set the formula equal to 37?" onChange={(e) => setGenieQuestion(e.target.value)} />
            </label>
            <div className={styles.row}>
              <button type="button" className={`${styles.btn} ${styles.genieBtn}`} disabled={genieBusy} onClick={() => void ask()}>{genieBusy ? "Thinking..." : "Ask"}</button>
            </div>
            {genieAnswer && <div className={styles.genieAnswer} role="status"><RichText text={genieAnswer} /></div>}
          </section>
        )}
      </div>

      <div className={styles.foot}>
        <div className={styles.footIn}>
          <button type="button" className={styles.btn} disabled={index === 0} onClick={() => setIndex(index - 1)}>&lsaquo; Back</button>
          {!practice && !preview && <button type="button" className={`${styles.btn} ${styles.genieBtn}`} aria-expanded={genieOpen} onClick={() => setGenieOpen((open) => !open)}>Ask Genie</button>}
          <button type="button" className={`${styles.btn} ${styles.go}`} disabled={!canContinue || busy} onClick={() => (last ? void finish() : setIndex(index + 1))}>
            {last ? (busy ? "Saving..." : "Finish and see my score") : "Continue ›"}
          </button>
        </div>
      </div>
    </div>
  );
}
