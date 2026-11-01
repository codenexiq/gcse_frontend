import { FilePlus2 } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./MonthlyReportAction.module.css";

/** Its own section above the reports table: the entry to the Monthly Progress Report Builder. */
export default function MonthlyReportAction() {
  return (
    <section className={styles.section} aria-label="Monthly progress report builder">
      <Button href="/tutor/dashboard/monthly-progress/new" variant="brand" size="md" icon={<FilePlus2 />}>
        Monthly Progress Report Builder
      </Button>
    </section>
  );
}
