"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./HoverCard.module.css";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** A flat card that fades in when scrolled into view and lifts when hovered. */
export default function HoverCard({ children, className = "", delay = 0 }: HoverCardProps) {
  return (
    <motion.div
      className={`${styles.card} ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div className={styles.content}>{children}</div>
    </motion.div>
  );
}
