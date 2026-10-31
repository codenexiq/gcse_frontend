import ShortcutCard from "@/components/dashboard/ShortcutCard";
import styles from "./TutorWork.module.css";

/** The "Tutor Work" page: one card for each screen in this section. More will be added as they are built. */
export default function TutorWork() {
  return (
    <section className={styles.grid} aria-label="Tutor Work">
      <ShortcutCard
        href="/tutor/dashboard/tutor-work/diagnostic-questions"
        title="Diagnostic questions"
        text="Write, change and delete the questions students answer in the diagnostic."
      />
    </section>
  );
}
