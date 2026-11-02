"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyReport, type MonthlyReport } from "@/lib/monthlyReport";

const KEY = "gcse-monthly-report-draft-v2";

/** The report being written. It is saved in this browser only, so a refresh does not lose it. */
export default function useMonthlyReport() {
  const [report, setReport] = useState<MonthlyReport>(emptyReport);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setReport({ ...emptyReport(), ...JSON.parse(saved) });
    } catch {
      // Storage blocked or damaged: start with a blank report.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(report));
    } catch {
      // Not saved: the report still works on screen.
    }
  }, [report, loaded]);

  const update = useCallback((patch: Partial<MonthlyReport>) => setReport((r) => ({ ...r, ...patch })), []);
  /** A blank report for the next student; the tutor's own details stay. */
  const nextStudent = useCallback(
    () => setReport((r) => ({ ...emptyReport(), yourName: r.yourName, subject: r.subject, yearGroup: r.yearGroup, tier: r.tier, month: r.month })),
    [],
  );
  return { report, update, nextStudent };
}
