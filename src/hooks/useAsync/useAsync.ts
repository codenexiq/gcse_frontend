"use client";

import { useState, useCallback } from "react";

/** Tracks loading / error state for an async action (e.g. submitting a form). */
export function useAsync<Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: Args): Promise<Result | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { run, loading, error };
}
