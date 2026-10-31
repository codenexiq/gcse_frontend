"use client";

import { AnimatePresence } from "framer-motion";
import type { ToastData } from "@/types";
import Toast from "../Toast";
import styles from "./ToastContainer.module.css";

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: number) => void;
}

/** The fixed stack in the top-right corner that holds all visible toasts. */
export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className={styles.viewport} aria-live="polite" aria-label="Notifications">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
