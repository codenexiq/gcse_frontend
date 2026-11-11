"use client";

import { useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/adm/ui/Toast";

/**
 * "Changes save straight away" (the prototype's rule). Call the returned function with the new value after each edit:
 * typing waits a moment so every key is not sent, and choices (`now`) are sent at once. A pending edit is sent when the screen closes.
 */
export function useAutosave<T>(save: (value: T) => Promise<unknown>, delay = 600) {
  const toast = useToast();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ value: T } | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  const run = useCallback(async () => {
    const job = pending.current;
    pending.current = null;
    if (!job) return;
    try {
      await saveRef.current(job.value);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    }
  }, [toast]);

  const queue = useCallback(
    (value: T, now = false) => {
      pending.current = { value };
      if (timer.current) clearTimeout(timer.current);
      if (now) void run();
      else timer.current = setTimeout(() => void run(), delay);
    },
    [delay, run]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      void run();
    },
    [run]
  );

  return queue;
}
