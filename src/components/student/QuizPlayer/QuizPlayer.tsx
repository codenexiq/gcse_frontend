"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { diagramUrl, formatQuizDate, percent, tone } from "@/lib/quiz";
import { submitQuizAttempt } from "@/services/quizService";
import type { QuizAttempt, QuizForStudent, QuizResult } from "@/types";
import styles from "./QuizPlayer.module.css";

type Stage = "intro" | "play" | "result";

interface Props {
  quiz: QuizForStudent;
  /** This student's earlier tries, newest first. */
  attempts: QuizAttempt[];
}

/** Take a quiz: the questions one at a time, then the score with the right answers and explanations. The server does the marking. */
export default function QuizPlayer({ quiz, attempts: earlier }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState(earlier);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const answered = Object.keys(answers).length;
  const allAnswered = answered === total;

  function start() {
    setAnswers({});
    setResult(null);
    setIndex(0);
    setError("");
    setStage("play");
  }

  async function finish() {
    if (!allAnswered || busy) return;
    setBusy(true);
    setError("");
    try {
      const marked = await submitQuizAttempt(quiz.id, answers);
      setResult(marked);
      setAttempts((old) => [{ id: marked.attemptId, quizId: quiz.id, studentId: 0, studentName: "", studentCode: "", score: marked.score, marks: marked.marks, questionCount: marked.questionCount, totalMarks: marked.totalMarks, createdAt: new Date().toISOString() }, ...old]);
      setStage("result");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not hand in your answers. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "intro") {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <h2 className={styles.title}>{quiz.title}</h2>
          {quiz.subtitle && <p className={styles.sub}>{quiz.subtitle}</p>}
          <p className={styles.facts}>{total} question{total === 1 ? "" : "s"} · {quiz.totalMarks} marks</p>
          {quiz.instructions && <p className={styles.instructions}>{quiz.instructions}</p>}
          <div className={styles.row}>
            <button type="button" className={styles.primary} onClick={start}>{attempts.length ? "Try again" : "Start quiz"} <ArrowRight size={16} aria-hidden="true" /></button>
            <Link href="/student/quizzes" className={styles.ghost}>All quizzes</Link>
          </div>
        </section>
        {attempts.length > 0 && (
          <section className={styles.card} aria-label="Your earlier tries">
            <h3 className={styles.heading}>Your earlier tries</h3>
            <ul className={styles.tries}>
              {attempts.slice(0, 8).map((a) => (
                <li key={a.id} className={styles.try}>
                  <span>{formatQuizDate(a.createdAt)}</span>
                  <span className={`${styles.pill} ${styles[tone(a.score, a.questionCount)]}`}>{a.score}/{a.questionCount} · {percent(a.score, a.questionCount)}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  if (stage === "result" && result) {
    const level = tone(result.score, result.questionCount);
    return (
      <div className={styles.page}>
        <section className={`${styles.card} ${styles.scoreCard} ${styles[`${level}Card`]}`} aria-live="polite">
          <p className={styles.scoreLabel}>Your score</p>
          <p className={styles.score}>{result.score}<span className={styles.outOf}>/{result.questionCount}</span></p>
          <p className={styles.message}>{result.message}</p>
          <p className={styles.facts}>{percent(result.score, result.questionCount)}% · {result.marks} of {result.totalMarks} marks</p>
          <div className={styles.row}>
            <button type="button" className={styles.primary} onClick={start}>Try again</button>
            <Link href="/student/quizzes" className={styles.ghost}>All quizzes</Link>
          </div>
        </section>

        <section className={styles.card} aria-label="Review">
          <h3 className={styles.heading}>Review your answers</h3>
          <ol className={styles.review}>
            {result.results.map((r) => (
              <li key={r.id} className={`${styles.reviewItem} ${r.isCorrect ? styles.reviewRight : styles.reviewWrong}`}>
                <div className={styles.reviewHead}>
                  <span className={styles.reviewNumber}>Question {r.id}</span>
                  <span className={`${styles.verdict} ${r.isCorrect ? styles.good : styles.low}`}>
                    {r.isCorrect ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />} {r.isCorrect ? "Correct" : r.chosen ? "Not quite" : "Not answered"}
                  </span>
                </div>
                <p className={styles.reviewQuestion}>{r.question}</p>
                {!r.isCorrect && r.chosen && <p className={styles.line}><strong>Your answer:</strong> {r.chosen}. {r.options[r.chosen]}</p>}
                <p className={styles.line}><strong>Correct answer:</strong> {r.correct}. {r.options[r.correct]}</p>
                {r.explanation && <p className={styles.explain}>{r.explanation}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.progressTop}>
          <span className={styles.facts}>Question {index + 1} of {total}</span>
          <span className={styles.facts}>{answered} answered</span>
        </div>
        <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} aria-label="Questions answered">
          <span className={styles.barFill} style={{ width: `${(answered / total) * 100}%` }} />
        </div>

        <div className={styles.meta}>
          {question.ref && <span>{question.ref}</span>}
          {question.topic && <span>{question.topic}</span>}
          <span>{question.marks} mark{question.marks === 1 ? "" : "s"}</span>
        </div>
        <h2 className={styles.question}>{question.question}</h2>
        {question.diagramKey && (
          // eslint-disable-next-line @next/next/no-img-element -- an SVG shown as a picture, which can never run code on the page
          <img key={question.diagramKey} className={styles.picture} src={diagramUrl(quiz.id, question.diagramKey)} alt={question.diagram || `Diagram for question ${index + 1}`} />
        )}
        {question.diagram && <p className={styles.diagram}><strong>Diagram:</strong> {question.diagram}</p>}

        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>Choose your answer</legend>
          {Object.entries(question.options).map(([letter, text]) => (
            <label key={letter} className={`${styles.option} ${answers[question.id] === letter ? styles.chosen : ""}`}>
              <input type="radio" name={`q-${question.id}`} value={letter} checked={answers[question.id] === letter} onChange={() => setAnswers((old) => ({ ...old, [question.id]: letter }))} />
              <span className={styles.letter}>{letter}</span>
              <span className={styles.optionText}>{text}</span>
            </label>
          ))}
        </fieldset>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.nav}>
          <button type="button" className={styles.ghost} onClick={() => setIndex((i) => i - 1)} disabled={index === 0 || busy}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
          {index < total - 1 ? (
            <button type="button" className={styles.primary} onClick={() => setIndex((i) => i + 1)} disabled={busy}>Next <ArrowRight size={16} aria-hidden="true" /></button>
          ) : (
            <button type="button" className={styles.primary} onClick={finish} disabled={!allAnswered || busy}>{busy ? "Marking..." : "Finish quiz"}</button>
          )}
        </div>
        {index === total - 1 && !allAnswered && <p className={styles.hint}>Answer every question to finish. Use the numbers below to go back to one you skipped.</p>}

        <div className={styles.jump} aria-label="Go to a question">
          {quiz.questions.map((q, i) => (
            <button key={q.id} type="button" className={`${styles.dot} ${answers[q.id] ? styles.dotDone : ""} ${i === index ? styles.dotNow : ""}`} onClick={() => setIndex(i)} aria-label={`Question ${i + 1}${answers[q.id] ? ", answered" : ", not answered"}`} aria-current={i === index ? "step" : undefined} disabled={busy}>{i + 1}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
