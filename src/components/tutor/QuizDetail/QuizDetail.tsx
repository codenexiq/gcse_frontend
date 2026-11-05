import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { diagramUrl, formatQuizDate, percent } from "@/lib/quiz";
import type { QuizAttempt, QuizForTutor } from "@/types";
import styles from "./QuizDetail.module.css";

interface Props {
  quiz: QuizForTutor;
  attempts: QuizAttempt[];
}

/** One quiz for a tutor: the results so far, then every question with the right answer marked. */
export default function QuizDetail({ quiz, attempts }: Props) {
  const average = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + percent(a.score, a.questionCount), 0) / attempts.length) : null;
  const students = new Set(attempts.map((a) => a.studentId)).size;

  return (
    <div className={styles.page}>
      <Link href="/tutor/dashboard/quizzes" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> All quizzes</Link>

      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{quiz.title}</h2>
          {quiz.subtitle && <p className={styles.sub}>{quiz.subtitle}</p>}
          {quiz.instructions && <p className={styles.instructions}>{quiz.instructions}</p>}
        </div>
        <span className={`${styles.badge} ${quiz.published ? styles.live : styles.hidden}`}>{quiz.published ? "Published" : "Hidden from students"}</span>
      </header>

      <dl className={styles.stats}>
        <div className={styles.stat}><dt>Questions</dt><dd>{quiz.questionCount}</dd></div>
        <div className={styles.stat}><dt>Total marks</dt><dd>{quiz.totalMarks}</dd></div>
        <div className={styles.stat}><dt>Attempts</dt><dd>{attempts.length}</dd></div>
        <div className={styles.stat}><dt>Students</dt><dd>{students}</dd></div>
        <div className={styles.stat}><dt>Average score</dt><dd>{average === null ? "-" : `${average}%`}</dd></div>
      </dl>

      <section className={styles.panel} aria-label="Results">
        <h3 className={styles.heading}>Results</h3>
        {attempts.length === 0 ? (
          <p className={styles.empty}>No student has taken this quiz yet.</p>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr><th>Student</th><th>ID</th><th className={styles.center}>Score</th><th className={styles.center}>Marks</th><th className={styles.center}>Percent</th><th>Date</th></tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className={styles.strong}>{a.studentName}</td>
                    <td>{a.studentCode || "-"}</td>
                    <td className={styles.center}>{a.score}/{a.questionCount}</td>
                    <td className={styles.center}>{a.marks}/{a.totalMarks}</td>
                    <td className={styles.center}>{percent(a.score, a.questionCount)}%</td>
                    <td className={styles.date}>{formatQuizDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel} aria-label="Questions">
        <h3 className={styles.heading}>Questions and answers</h3>
        <ol className={styles.questions}>
          {quiz.questions.map((q) => (
            <li key={q.id} className={styles.question}>
              <div className={styles.meta}>
                <span>{q.ref || `Q${q.id}`}</span>
                {q.topic && <span>{q.topic}</span>}
                <span>{q.marks} mark{q.marks === 1 ? "" : "s"}</span>
              </div>
              <p className={styles.text}>{q.question}</p>
              {q.diagramKey && (
                // eslint-disable-next-line @next/next/no-img-element -- an SVG shown as a picture, which can never run code on the page
                <img className={styles.picture} src={diagramUrl(quiz.id, q.diagramKey)} alt={q.diagram || `Diagram for question ${q.id}`} loading="lazy" />
              )}
              {q.diagram && <p className={styles.diagram}>Diagram: {q.diagram}</p>}
              <ul className={styles.options}>
                {Object.entries(q.options).map(([letter, text]) => (
                  <li key={letter} className={`${styles.option} ${letter === q.correct ? styles.right : ""}`}>
                    <span className={styles.letter}>{letter}</span>
                    <span className={styles.optionText}>{text}</span>
                    {letter === q.correct && <Check size={16} aria-label="Correct answer" />}
                  </li>
                ))}
              </ul>
              {q.explanation && <p className={styles.explain}>{q.explanation}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
