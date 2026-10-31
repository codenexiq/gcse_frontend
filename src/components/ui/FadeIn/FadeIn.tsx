"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Fades and slides its children up when they appear. Use `delay` to stagger. */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
}

export default function FadeIn({ children, delay = 0, y = 16 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
