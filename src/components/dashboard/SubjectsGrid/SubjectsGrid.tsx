"use client";

import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Stagger from "@/components/ui/Stagger";
import StaggerItem from "@/components/ui/StaggerItem";
import { useSubjects } from "@/hooks/useSubjects";
import styles from "./SubjectsGrid.module.css";

/** Every subject as a card listing its topics. The data is loaded once and cached. */
export default function SubjectsGrid() {
  const { subjects, loading, error } = useSubjects();

  if (loading) return <Spinner size={22} label="Loading subjects…" />;
  if (error) return <Alert>Could not load subjects: {error}</Alert>;

  return (
    <Stagger className={styles.grid} staggerChildren={0.06}>
      {subjects.map((subject) => (
        <StaggerItem key={subject.id} className={styles.cell}>
          <article className={styles.card}>
            <span aria-hidden="true" className={styles.letter}>{subject.name.charAt(0)}</span>
            <h2 className={styles.name}>{subject.name}</h2>
            <p className={styles.count}>{subject.topics.length} topics</p>
            <ul className={styles.topics}>
              {subject.topics.map((topic) => (
                <li key={topic.id}>{topic.name}</li>
              ))}
            </ul>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
