"use client";

import { useState } from "react";
import MathText from "@/components/ui/MathText";
import type { DiagnosticQuestion } from "@/types";
import styles from "./DiagnosticQuiz.module.css";

interface Props {
  questions: DiagnosticQuestion[];
  /** e.g. "GCSE Maths · Higher" */
  heading: string;
  /** Back from the first question: returns to the intro card. */
  onExit: () => void;
  /** Where to send the tutor when there are no questions yet. */
  builderHref: string;
}

/** Answer value meaning "I haven't learned this yet". */
const NOT_LEARNED = -1;

/** The question screen: one question at a time, then a short summary. */
export default function DiagnosticQuiz({ questions, heading, onExit, builderHref }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return (
      <section className={styles.card} aria-label="Diagnostic questions">
        <h2 className={styles.question}>No questions yet</h2>
        <p className={styles.note}>There are no questions for {heading} yet. Write some on the diagnostic questions screen.</p>
        <div className={styles.footer}>
          <button type="button" className={styles.back} onClick={onExit}>Back</button>
          <a className={styles.next} href={builderHref}>Write questions</a>
        </div>
      </section>
    );
  }

  if (finished) {
    const values = questions.map((q) => answers[q.id]);
    const correct = questions.filter((q) => q.options[answers[q.id]]?.isCorrect).length;
    const notLearned = values.filter((v) => v === NOT_LEARNED).length;
    return (
      <section className={styles.card} aria-label="Diagnostic summary">
        <h2 className={styles.question}>Diagnostic complete</h2>
        <ul className={styles.summary}>
          <li><strong>{correct}</strong> of {questions.length} correct</li>
          <li><strong>{notLearned}</strong> marked &ldquo;I haven&rsquo;t learned this yet&rdquo;</li>
          <li><strong>{questions.length - correct - notLearned}</strong> incorrect</li>
        </ul>
        <div className={styles.footer}>
          <button type="button" className={styles.back} onClick={() => { setFinished(false); setIndex(0); setAnswers({}); }}>Start again</button>
          <button type="button" className={styles.next} onClick={onExit}>Close</button>
        </div>
      </section>
    );
  }

  const q = questions[index];
  const chosen = answers[q.id];
  const last = index === questions.length - 1;
  const choose = (value: number) => setAnswers((a) => ({ ...a, [q.id]: value }));

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
        <button type="button" className={styles.back} onClick={() => (index === 0 ? onExit() : setIndex(index - 1))}>Back</button>
        <button type="button" className={styles.next} disabled={chosen === undefined} onClick={() => (last ? setFinished(true) : setIndex(index + 1))}>
          {last ? "Finish" : "Next question"}
        </button>
      </div>
    </div>
  );
}
