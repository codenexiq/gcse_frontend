"use client";

import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import styles from "./Spinner.module.css";

export default function Spinner({ size = 20, label }: { size?: number; label?: string }) {
  return (
    <span className={styles.wrap} role="status">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ display: "inline-flex" }}
      >
        <LoaderCircle size={size} aria-hidden="true" />
      </motion.span>
      {label && <span>{label}</span>}
    </span>
  );
}
