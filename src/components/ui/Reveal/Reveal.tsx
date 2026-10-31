"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /** Where it slides in from. */
  from?: "up" | "left" | "right";
  className?: string;
}

const offsets = { up: { y: 32 }, left: { x: -32 }, right: { x: 32 } };

/** Fades and slides its children in when they scroll into view (once). */
export default function Reveal({ children, delay = 0, from = "up", className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
