"use client";

import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Package } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/utils/formatDate";
import type { Item } from "@/types";
import styles from "./ItemList.module.css";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const card = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <EmptyState title="No items yet" text="Add your first item using the form above." />;
  }

  return (
    <motion.ul className={styles.list} variants={container} initial="hidden" animate="show">
      {items.map((item) => (
        <motion.li
          key={item.id}
          className={styles.card}
          variants={card}
          whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(16, 24, 40, 0.12)" }}
        >
          <span className={styles.icon}>
            <Package size={20} aria-hidden="true" />
          </span>
          <div>
            <h3>{item.title}</h3>
            {item.topicName && (
              <span className={styles.badge}>
                <BookOpen size={14} aria-hidden="true" /> {item.subjectName} · {item.topicName}
              </span>
            )}
            {item.description && <p>{item.description}</p>}
            <small className={styles.date}>
              <CalendarDays size={14} aria-hidden="true" /> Added {formatDate(item.created_at)}
            </small>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}
