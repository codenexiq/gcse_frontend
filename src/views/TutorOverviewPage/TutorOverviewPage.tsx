import { BookOpen, Package, ShieldCheck, Users } from "lucide-react";
import { roleLabel } from "@/lib/roles";
import { getTutorOverview } from "@/services/tutorService";
import { requireTutor } from "@/lib/session";
import StatCard from "@/components/dashboard/StatCard";
import ShortcutCard from "@/components/dashboard/ShortcutCard";
import Reveal from "@/components/ui/Reveal";
import Alert from "@/components/ui/Alert";
import type { TutorOverview } from "@/types";
import styles from "./TutorOverviewPage.module.css";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The tutor dashboard overview: school-wide numbers, plus shortcuts to the tutor pages. */
export default async function TutorOverviewPage() {
  const user = await requireTutor();
  const isAdmin = user.role === "admin";

  let overview: TutorOverview | null = null;
  let error: string | null = null;
  try {
    overview = await getTutorOverview();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (!overview) return <Alert>Could not load the overview: {error}</Alert>;

  return (
    <>
      <Reveal>
        <section aria-label="School summary" className={styles.cards}>
          <StatCard
            label="Students"
            title={overview.students === 1 ? "1 student" : `${overview.students} students`}
            text="Everyone who has registered as a student on Educate Cloud."
            icon={<Users aria-hidden="true" />}
            color="purple"
            link={{ href: "/tutor/dashboard/students", label: "Open the directory" }}
          />
          <StatCard
            label="Subjects"
            title={`${overview.subjects} subjects · ${overview.topics} topics`}
            text="The subjects and topics students can link their revision items to."
            icon={<BookOpen aria-hidden="true" />}
            color="blue"
          />
          <StatCard
            label="Student activity"
            title={overview.items === 1 ? "1 item" : `${overview.items} items`}
            text="Revision items students have added so far, across every subject."
            icon={<Package aria-hidden="true" />}
            color="green"
          />
          <StatCard
            label="Your role"
            title={roleLabel(user.role)}
            text={
              isAdmin
                ? `You can see every student and ${plural(overview.tutors + overview.admins, "tutor account")}.`
                : "You can see every student. Account changes are made by an administrator."
            }
            icon={<ShieldCheck aria-hidden="true" />}
            color="orange"
            badge="Session active"
          />
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <div className={styles.shortcuts}>
          <ShortcutCard
            href="/tutor/dashboard/students"
            title="Student directory"
            text="Search every student account and see when each one registered."
          />
          {isAdmin && (
            <ShortcutCard
              href="/tutor/dashboard/accounts"
              title="Tutor accounts"
              text={`See the ${plural(overview.tutors, "tutor")} and ${plural(overview.admins, "administrator")} who can sign in.`}
            />
          )}
        </div>
      </Reveal>
    </>
  );
}
