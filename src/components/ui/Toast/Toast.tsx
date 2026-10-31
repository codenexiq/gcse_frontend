"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, TriangleAlert, X } from "lucide-react";
import type { ToastData } from "@/types";
import styles from "./Toast.module.css";

interface ToastProps {
  toast: ToastData;
  onClose: (id: number) => void;
}

/** The round coloured icon on the left: "!" for errors, a tick, a warning triangle, or "i". */
function ToastIcon({ variant }: { variant: ToastData["variant"] }) {
  if (variant === "warning") {
    return <TriangleAlert className={styles.triangle} size={28} fill="currentColor" stroke="#fff" aria-hidden="true" />;
  }
  return (
    <span className={styles.icon} aria-hidden="true">
      {variant === "success" ? <Check size={17} strokeWidth={3.5} /> : variant === "error" ? "!" : "i"}
    </span>
  );
}

/** One notification card. It closes itself after `duration` ms - it never waits for the mouse. */
export default function Toast({ toast, onClose }: ToastProps) {

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      layout
      className={`${styles.toast} ${styles[toast.variant]}`}
      role={toast.variant === "error" ? "alert" : "status"}
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <ToastIcon variant={toast.variant} />
      <div className={styles.body}>
        <strong className={styles.title}>{toast.title}</strong>
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => onClose(toast.id)}
        aria-label={`Dismiss ${toast.title} notification`}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
