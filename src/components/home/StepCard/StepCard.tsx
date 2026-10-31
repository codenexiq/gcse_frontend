"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./StepCard.module.css";

interface StepCardProps {
  number: number;
  icon: ReactNode;
  title: string;
  text: string;
  delay?: number;
}

/** One step of "How it works": a numbered badge that pops in, then the text. */
export default function StepCard({ number, icon, title, text, delay = 0 }: StepCardProps) {
  return (
    <motion.div
      className={styles.step}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={styles.badge}
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: delay + 0.15 }}
      >
        {icon}
        <span className={styles.number}>{number}</span>
      </motion.div>
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.div>
  );
}
