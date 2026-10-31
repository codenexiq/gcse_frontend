"use client";

import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { ToastData, ToastVariant } from "@/types";
import ToastContainer from "../ToastContainer";

export interface ToastOptions {
  /** Replace the default heading (Error / Success / Warning / Information). */
  title?: string;
  /** Milliseconds before it closes by itself. Can only make it shorter (the limit is 1200). */
  duration?: number;
}

interface ToastContextValue {
  show: (variant: ToastVariant, message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  error: "Error",
  success: "Success",
  warning: "Warning",
  info: "Information",
};
// Every toast stays on screen for at most 1.5 seconds in total:
// 1.2 s showing + 0.2 s sliding away = about 1.4 s. This is also the MAXIMUM - a longer `duration` is cut down to it.
const TOAST_MS = 1200;
const MAX_TOASTS = 4; // older ones are dropped when more arrive

/** Put this once near the top of the app. Components then call useToast() to show toasts. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string, options: ToastOptions = {}) => {
      const id = nextId.current++;
      const toast: ToastData = {
        id,
        variant,
        message,
        title: options.title ?? DEFAULT_TITLES[variant],
        duration: Math.min(options.duration ?? TOAST_MS, TOAST_MS),
      };
      setToasts((list) => [...list, toast].slice(-MAX_TOASTS));
      return id;
    },
    []
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}
