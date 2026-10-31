"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./AuthBackground.module.css";

// Diameters (in vmin, so they scale with the screen) of the thin circles around the card.
const rings = [62, 86, 110, 134, 158];

/** The sky photo, with thin white circles around the centre that gently pulse outwards. */
export default function AuthBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <Image
        src="/images/login-background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.image}
      />
      {rings.map((size, i) => (
        <motion.span
          key={size}
          className={styles.ring}
          style={{ width: `${size}vmin`, height: `${size}vmin` }}
          animate={{ scale: [1, 1.035, 1], opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        />
      ))}
    </div>
  );
}
