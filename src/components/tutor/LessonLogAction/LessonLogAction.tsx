import { ClipboardPen } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./LessonLogAction.module.css";

/** Its own section above the lesson log table: the entry to the attendance and feedback form. */
export default function LessonLogAction() {
  return (
    <section className={styles.section} aria-label="New lesson entry">
      <Button href="/tutor/dashboard/lesson-log/new" variant="brand" size="md" icon={<ClipboardPen />}>
        New lesson entry
      </Button>
    </section>
  );
}
