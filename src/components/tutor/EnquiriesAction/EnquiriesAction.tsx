import { Inbox } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./EnquiriesAction.module.css";

/** Its own section on the Settings page (administrators only): the entry to the website enquiries inbox. */
export default function EnquiriesAction() {
  return (
    <section className={styles.section} aria-label="Website enquiries">
      <Button href="/tutor/dashboard/enquiries" variant="brand" size="md" icon={<Inbox />}>
        Website enquiries
      </Button>
    </section>
  );
}
