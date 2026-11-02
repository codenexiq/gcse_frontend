"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { downloadReportPdf, reportFileName } from "@/lib/reportPdf";

/** Downloads the report shown on the page as a PDF. `busy` is true while the file is being made. */
export default function useReportPdf() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function download(studentName: string, month: string) {
    if (busy) return;
    setBusy(true);
    try {
      await downloadReportPdf(reportFileName(studentName, month));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The PDF could not be made. Please try again.", { title: "Download failed" });
    } finally {
      setBusy(false);
    }
  }

  return { busy, download };
}
