import Link from "next/link";
import { BookOpen, CalendarDays } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import type { Item } from "@/types";
import styles from "./RecentItems.module.css";

/** The latest few items, shown on the overview page. */
export default function RecentItems({ items }: { items: Item[] }) {
  return (
    <section aria-labelledby="recent-heading" className={styles.panel}>
      <div className={styles.head}>
        <h2 id="recent-heading" className={styles.title}>Recent items</h2>
        <Link href="/dashboard/items" className={styles.all}>View all →</Link>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>You have not added any items yet. Add your first one to see it here.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.main}>
                <p className={styles.name}>{item.title}</p>
                {item.topicName && (
                  <span className={styles.badge}>
                    <BookOpen size={12} aria-hidden="true" /> {item.subjectName} · {item.topicName}
                  </span>
                )}
              </div>
              <span className={styles.date}>
                <CalendarDays size={14} aria-hidden="true" /> {formatDate(item.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
