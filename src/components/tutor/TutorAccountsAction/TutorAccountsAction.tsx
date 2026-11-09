import { UserCog } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./TutorAccountsAction.module.css";

/** Its own section on the Settings page (administrators only): the entry to the Tutor accounts page. */
export default function TutorAccountsAction() {
  return (
    <section className={styles.section} aria-label="Tutor accounts">
      <Button href="/tutor/dashboard/accounts" variant="brand" size="md" icon={<UserCog />}>
        Tutor accounts
      </Button>
    </section>
  );
}
