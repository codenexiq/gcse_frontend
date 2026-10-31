"use client";

import { useContext, useMemo } from "react";
import { ToastContext, type ToastOptions } from "@/components/ui/ToastProvider";

/**
 * Show notifications from any component:
 *   const toast = useToast();
 *   toast.success("Item saved");
 *   toast.error("Upload failed - try again.", { title: "Upload error" });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  const { show, dismiss } = context;

  return useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) => show("success", message, options),
      error: (message: string, options?: ToastOptions) => show("error", message, options),
      warning: (message: string, options?: ToastOptions) => show("warning", message, options),
      info: (message: string, options?: ToastOptions) => show("info", message, options),
      dismiss,
    }),
    [show, dismiss]
  );
}
