import { BookOpen, Package, ShieldCheck } from "lucide-react";
import { getItems } from "@/services/itemService/itemService.server";
import { getSubjects } from "@/services/subjectService/subjectService.server";
import { requireUser } from "@/lib/session";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ShortcutCard from "@/components/dashboard/ShortcutCard";
import RecentItems from "@/components/dashboard/RecentItems";
import Reveal from "@/components/ui/Reveal";
import type { Item, Subject } from "@/types";
import styles from "./DashboardPage.module.css";

/** The dashboard overview: three summary cards, the latest items, and shortcuts. */
export default async function DashboardPage() {
  const user = await requireUser();

  // The page still works if either list fails to load.
  let items: Item[] = [];
  let subjects: Subject[] = [];
  try {
    items = await getItems();
  } catch {}
  try {
    subjects = await getSubjects();
  } catch {}

  const topicCount = subjects.reduce((total, subject) => total + subject.topics.length, 0);

  return (
    <>
      <Reveal>
        <section aria-label="Workspace summary" className={styles.cards}>
          <SummaryCard
            label="My items"
            title={items.length === 1 ? "1 item" : `${items.length} items`}
            text="Everything you have added to revise. Link each one to a subject and topic."
            icon={<Package aria-hidden="true" />}
            tone="lavender"
            link={{ href: "/dashboard/items", label: "Manage items" }}
          />
          <SummaryCard
            label="Subjects"
            title={`${subjects.length} subjects · ${topicCount} topics`}
            text="Every GCSE subject and the topics inside it, ready to pick from."
            icon={<BookOpen aria-hidden="true" />}
            tone="green"
            link={{ href: "/dashboard/subjects", label: "Browse subjects" }}
          />
          <SummaryCard
            label="Account"
            title="Signed in securely"
            text={`You are signed in as ${user.email}. Your items are private and only visible to you.`}
            icon={<ShieldCheck aria-hidden="true" />}
            tone="sand"
            badge="Session active"
          />
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <div className={styles.lower}>
          <RecentItems items={items.slice(0, 5)} />
          <div className={styles.shortcuts}>
            <ShortcutCard
              href="/dashboard/items"
              title="Add a new item"
              text="Write down what you need to revise and link it to a topic."
            />
            <ShortcutCard
              href="/dashboard/subjects"
              title="Browse subjects"
              text="See every subject with all of its topics."
            />
          </div>
        </div>
      </Reveal>
    </>
  );
}
