"use client";

import { motion } from "framer-motion";
import styles from "./WordReveal.module.css";

interface WordRevealProps {
  text: string;
  /** Words (exact match) that get the highlight colour. */
  highlight?: string[];
  /** Seconds to wait before the first word appears. */
  delay?: number;
}

/** Shows a sentence one word at a time, each word sliding up out of a mask. */
export default function WordReveal({ text, highlight = [], delay = 0 }: WordRevealProps) {
  return (
    <span aria-label={text} className={styles.text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className={styles.mask} aria-hidden="true">
          <motion.span
            className={`${styles.word} ${highlight.includes(word) ? styles.highlight : ""}`}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
