"use client";

import { useState } from "react";
import MathText from "@/components/ui/MathText";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import StudentResults from "@/components/student/StudentResults";
import { fillTemplate } from "@/utils/fillTemplate";
import { submitStudentDiagnostic } from "@/services/studentService";
import type { DiagnosticIntroContent, StudentDiagnosticResult, StudentQuestion } from "@/types";
import styles from "./StudentDiagnostic.module.css";

interface Props {
  content: DiagnosticIntroContent;
  level: string;
  subject: string;
  tier: string;
  questions: StudentQuestion[];
  /** The student's first name, for the results heading. */
  name: string;
  /** The result of an earlier attempt, shown straight away (null if they have not done it yet). */
  latest: StudentDiagnosticResult | null;
  /** A tutor has placed the student in a group. */
  hasGroup?: boolean;
}

/** Answer value meaning "I haven't learned this yet". */
const NOT_LEARNED = -1;

/** The student's Diagnostic screen: the intro card, then one question at a time, then the totals. */
export default function StudentDiagnostic({ content, level, subject, tier, questions, name, latest, hasGroup = false }: Props) {
  const toast = useToast();
  const [phase, setPhase] = useState<"intro" | "quiz" | "done">(latest ? "done" : "intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<StudentDiagnosticResult | null>(latest);
  const [busy, setBusy] = useState(false);

  const values = { level, subject, questions: questions.length || content.questions };
  const heading = `${level} ${subject}${tier === "Not sure yet" ? "" : ` · ${tier}`}`;

  if (phase === "intro") {
    const [beforeHint, afterHint] = fillTemplate(content.hint, values).split("{highlight}");
    return (
      <section className={styles.card} aria-label="Diagnostic introduction">
        <span className={styles.badge}>{content.badge}</span>
        <h2 className={styles.heading}>{fillTemplate(content.heading, values)}</h2>
        <p className={styles.intro}>{fillTemplate(content.intro, values)}</p>
        <p className={styles.hint}>
          {beforeHint}
          {afterHint !== undefined && <strong className={styles.highlight}>{content.highlight}</strong>}
          {afterHint}
        </p>
        {questions.length === 0 ? (
          <p className={styles.note}>There are no questions for {heading} yet. Please check back soon.</p>
        ) : (
          <button type="button" className={styles.next} onClick={() => setPhase("quiz")}>{content.buttonLabel}</button>
        )}
      </section>
    );
  }

  if (phase === "done" && result) {
    return (
      <StudentResults
        result={result}
        content={content}
        name={name}
        hasGroup={hasGroup}
        onRetake={() => { setIndex(0); setAnswers({}); setPhase("intro"); }}
      />
    );
  }

  const q = questions[index];
  const chosen = answers[q.id];
  const last = index === questions.length - 1;
  const choose = (value: number) => setAnswers((a) => ({ ...a, [q.id]: value }));

  async function finish() {
    setBusy(true);
    try {
      setResult(await submitStudentDiagnostic(Object.entries(answers).map(([questionId, choice]) => ({ questionId: Number(questionId), choice }))));
      setPhase("done");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <p className={styles.meta}>{heading}</p>
          <h2 className={styles.count}>Question {index + 1} of {questions.length}</h2>
        </div>
        <span className={styles.topic}>{q.topic}</span>
      </header>
      <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1} aria-label="Progress">
        <div className={styles.fill} style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <section className={styles.card} aria-label="Question">
        <h3 className={styles.question}><MathText text={q.question} /></h3>
        <div className={styles.options} role="radiogroup" aria-label="Answers">
          {q.options.map((o, i) => (
            <label key={i} className={`${styles.option} ${chosen === i ? styles.chosen : ""}`}>
              <input type="radio" name={`q-${q.id}`} className={styles.radio} checked={chosen === i} onChange={() => choose(i)} />
              <span className={styles.dot} aria-hidden="true" />
              <MathText text={o.text} />
            </label>
          ))}
          <label className={`${styles.option} ${styles.unknown} ${chosen === NOT_LEARNED ? styles.chosen : ""}`}>
            <input type="radio" name={`q-${q.id}`} className={styles.radio} checked={chosen === NOT_LEARNED} onChange={() => choose(NOT_LEARNED)} />
            <span className={styles.dot} aria-hidden="true" />
            I haven&rsquo;t learned this yet
          </label>
        </div>
      </section>

      <div className={styles.footer}>
        <button type="button" className={styles.back} onClick={() => (index === 0 ? setPhase("intro") : setIndex(index - 1))}>Back</button>
        <button type="button" className={styles.next} disabled={chosen === undefined || busy} onClick={() => (last ? finish() : setIndex(index + 1))}>
          {last ? (busy ? "Saving..." : "Finish") : "Next question"}
        </button>
      </div>
    </div>
  );
}
