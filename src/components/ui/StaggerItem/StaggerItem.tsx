"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** One item inside <Stagger>. It fades and slides up when its turn comes. */
export default function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
