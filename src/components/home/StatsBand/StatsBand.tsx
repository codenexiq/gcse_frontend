"use client";

import { BookOpen, ChartNoAxesColumn, Layers, Package, ShieldCheck } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { useSubjects } from "@/hooks/useSubjects";
import styles from "./StatsBand.module.css";

/**
 * Four headline numbers. Subjects/topics come from the cached subject data (no extra API call).
 * `itemCount` is the logged-in user's items, or null for visitors.
 */
export default function StatsBand({ itemCount }: { itemCount: number | null }) {
  const { subjects } = useSubjects();
  const topicCount = subjects.reduce((total, s) => total + s.topics.length, 0);
  const average = subjects.length ? Math.round(topicCount / subjects.length) : 0;

  const stats = [
    { icon: <BookOpen />, value: subjects.length, suffix: "", label: "GCSE subjects" },
    { icon: <Layers />, value: topicCount, suffix: "", label: "Topics to revise" },
    itemCount === null
      ? { icon: <ChartNoAxesColumn />, value: average, suffix: "", label: "Topics per subject" }
      : { icon: <Package />, value: itemCount, suffix: "", label: "Your items" },
    { icon: <ShieldCheck />, value: 100, suffix: "%", label: "Private to you" },
  ];

  return (
    <Reveal>
      <section className={styles.band}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.icon}>{stat.icon}</span>
            <strong className={styles.value}>
              <CountUp value={stat.value} suffix={stat.suffix} />
            </strong>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </section>
    </Reveal>
  );
}
