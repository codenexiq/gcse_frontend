"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child appearing. */
  staggerChildren?: number;
  /** How much of the group must be visible (0-1) before it starts. */
  amount?: number;
}

/** Wrap a group of <StaggerItem>s: they appear one after another when scrolled into view. */
export default function Stagger({ children, className, staggerChildren = 0.08, amount = 0.15 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren } } }}
    >
      {children}
    </motion.div>
  );
}
