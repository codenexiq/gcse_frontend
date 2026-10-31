"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { useSubjects } from "@/hooks/useSubjects";
import type { Subject } from "@/types";
import { subjectIcon } from "./subjectIcons";
import styles from "./SubjectsMarquee.module.css";

function Row({ subjects, reverse = false }: { subjects: Subject[]; reverse?: boolean }) {
  // The list is repeated twice so the loop never shows a gap.
  const doubled = [...subjects, ...subjects];
  return (
    <div className={styles.row}>
      <div className={`${styles.track} ${reverse ? styles.reverse : ""}`}>
        {doubled.map((subject, i) => {
          const Icon = subjectIcon(subject.slug);
          return (
            <span key={`${subject.id}-${i}`} className={styles.chip} aria-hidden={i >= subjects.length}>
              <Icon size={18} />
              <b>{subject.name}</b>
              <small>{subject.topics.length} topics</small>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Two rows of subject chips scrolling in opposite directions. Pauses when hovered. */
export default function SubjectsMarquee() {
  const { subjects } = useSubjects(); // loaded once, then cached
  const half = Math.ceil(subjects.length / 2);

  return (
    <section id="subjects" className={styles.section}>
      <SectionHeading
        eyebrow="Subjects"
        title="Every GCSE subject, one tap away"
        subtitle="Pick a subject, choose a topic, and keep all your revision organised."
      />
      {subjects.length > 0 && (
        <div className={styles.marquee}>
          <Row subjects={subjects.slice(0, half)} />
          <Row subjects={subjects.slice(half)} reverse />
        </div>
      )}
    </section>
  );
}
