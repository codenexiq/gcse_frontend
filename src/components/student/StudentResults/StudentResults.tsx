import Link from "next/link";
import type { DiagnosticIntroContent, StudentDiagnosticResult } from "@/types";
import styles from "./StudentResults.module.css";

interface Props {
  result: StudentDiagnosticResult;
  /** The wording of the "What happens next" card (set by tutors). */
  content: DiagnosticIntroContent;
  /** First name, for the heading. */
  name: string;
  /** Start the diagnostic again. */
  onRetake: () => void;
}

const topicList = (topics: string[]) => (topics.length ? topics.join(", ") : "None");

/** What a student sees when they finish the diagnostic: what is strong, what needs work, and what happens next. */
export default function StudentResults({ result, content, name, onRetake }: Props) {
  const { misconceptions } = result;
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Diagnostic complete &middot; {result.correct} of {result.total} correct</p>
        <h2 className={styles.title}>Nice work, {name}. Here&rsquo;s what we found.</h2>
      </header>

      <div className={styles.cards}>
        <section className={`${styles.card} ${styles.strong}`} aria-label="Strong">
          <p className={styles.number}>{result.correct}</p>
          <h3 className={styles.label}>Strong</h3>
          <p className={styles.topics}>{topicList(result.strong)}</p>
        </section>
        <section className={`${styles.card} ${styles.need}`} aria-label="Need work">
          <p className={styles.number}>{result.incorrect}</p>
          <h3 className={styles.label}>Need work</h3>
          <p className={styles.topics}>{topicList(result.needWork)}</p>
        </section>
        <section className={`${styles.card} ${styles.unknown}`} aria-label="Not learned yet">
          <p className={styles.number}>{result.notLearned}</p>
          <h3 className={styles.label}>Not learned yet</h3>
          <p className={styles.topics}>{topicList(result.notLearnedTopics)}</p>
        </section>
      </div>

      {misconceptions.length > 0 && (
        <section className={styles.panel} aria-label="Misconceptions">
          <h3 className={styles.panelTitle}>
            {misconceptions.length} {misconceptions.length === 1 ? "misconception" : "misconceptions"} we&rsquo;ll fix together
          </h3>
          <p className={styles.panelText}>These aren&rsquo;t careless slips. They&rsquo;re patterns, so a teacher will go through them with you.</p>
          <ol className={styles.list}>
            {misconceptions.map((m, i) => (
              <li key={`${m.topic}-${m.text}`} className={styles.item}>
                <span className={styles.index}>{i + 1}</span>
                <div>
                  <p className={styles.itemTopic}>{m.topic}</p>
                  <p className={styles.itemText}>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className={styles.next} aria-label={content.nextLabel}>
        <p className={styles.nextLabel}>{content.nextLabel}</p>
        <h3 className={styles.nextHeading}>{content.nextHeading}</h3>
        <p className={styles.nextText}>{content.nextText}</p>
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.again} onClick={onRetake}>Take it again</button>
        <Link href="/student/group" className={styles.go}>Continue to your group</Link>
      </div>
    </div>
  );
}
