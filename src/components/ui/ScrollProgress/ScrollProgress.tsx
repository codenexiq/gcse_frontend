"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./ScrollProgress.module.css";

/** A thin solid bar at the top of the screen that fills as you scroll down the page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });

  return <motion.div className={styles.bar} style={{ scaleX }} aria-hidden="true" />;
}
