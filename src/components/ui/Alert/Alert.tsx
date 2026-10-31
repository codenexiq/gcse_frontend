"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import styles from "./Alert.module.css";

/** Red error box that animates in and out. Renders nothing if `children` is empty. */
export default function Alert({ children }: { children?: ReactNode }) {
  return (
    <AnimatePresence>
      {children && (
        <motion.div
          className={styles.alert}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <CircleAlert size={18} aria-hidden="true" />
          <span>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
