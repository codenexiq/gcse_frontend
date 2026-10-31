import { Rocket } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./StudentStartupAction.module.css";

/** Its own section above the students table: the entry to the Student Start-up Screen page. */
export default function StudentStartupAction() {
  return (
    <section className={styles.section} aria-label="Student start-up">
      <Button href="/tutor/dashboard/students/start-up" variant="brand" size="md" icon={<Rocket />}>
        Student Start-up Screen
      </Button>
    </section>
  );
}
