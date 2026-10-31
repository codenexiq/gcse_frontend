"use client";

import { motion } from "framer-motion";
import styles from "./ShapesBackground.module.css";

const shapes = [
  { className: styles.circleBig, animate: { x: [0, 60, -30, 0], y: [0, 50, 20, 0] }, duration: 24 },
  { className: styles.circleSmall, animate: { x: [0, -50, 30, 0], y: [0, 40, -30, 0] }, duration: 20 },
  { className: styles.ring, animate: { x: [0, 40, -40, 0], y: [0, -40, 30, 0], rotate: [0, 20, 0] }, duration: 28 },
];

/** Flat, solid-colour shapes drifting slowly on a faint dotted grid, fixed behind the page. */
export default function ShapesBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.dots} />
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`${styles.shape} ${shape.className}`}
          animate={shape.animate}
          transition={{ duration: shape.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
