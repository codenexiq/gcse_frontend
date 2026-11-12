"use client";

import { useEffect, useState } from "react";
import Chip from "@/components/adm/ui/Chip";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { ApiError, apiFetch, send } from "@/lib/api";
import { plural } from "@/lib/format";
import type { ReportData } from "@/types/tutor";

/** The monthly report for a parent: facts from the month, a draft the tutor edits freely, then sent to the admin team (who email the parent). */
export default function ReportPanel({ enrolmentId, onClose }: { enrolmentId: number; onClose: () => void }) {
  const toast = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<ReportData>(`/tutor/reports/${enrolmentId}`)
      .then((r) => {
        setReport(r);
        setText(r.text);
      })
      .catch((err) => toast(err instanceof Error ? err.message : "The report could not be loaded."));
  }, [enrolmentId, toast]);

  if (!report) return <section className="card hl-card"><p className="muted" role="status">Loading the report…</p></section>;
  const f = report.facts;

  async function polish() {
    setBusy(true);
    try {
      const res = await send<{ text: string }>("POST", `/tutor/reports/${enrolmentId}/polish`, { text });
      if (res.text) setText(res.text);
    } catch (err) {
      toast(err instanceof ApiError && err.status === 503 ? "The AI helper is not switched on yet, so reports cannot be polished." : err instanceof Error ? err.message : "The AI could not help just now.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReport() {
    try {
      await send("POST", `/tutor/reports/${enrolmentId}/send`, { text });
      toast("Sent to the admin team. They'll email it to the parents.");
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "The report could not be sent.");
    }
  }

  return (
    <section className="card hl-card">
      <div className="row between">
        <h2>
          <Icon name="notes" /> {f.month} report
        </h2>
        <button type="button" className="btn ghost sm" onClick={onClose}>Close</button>
      </div>
      <div className="row">
        <Chip tone="c-blue">{f.attended}/{f.sessions} sessions</Chip>
        <Chip tone="c-lav">
          {plural(f.quizzes, "quiz")}
          {f.avg != null ? ` · avg ${f.avg}%` : ""}
        </Chip>
        <Chip tone="c-navy">{f.mastered}/{f.all} mastered</Chip>
      </div>
      <Field id="rep-text" label="Report" hint="Edit freely. The parent sees this.">
        <textarea id="rep-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={busy} onClick={() => void polish()}>
          {busy ? "Polishing…" : (
            <>
              <Icon name="star" />
              Polish with AI
            </>
          )}
        </button>
        <button type="button" className="btn primary" onClick={() => void sendReport()}>Send to admin team</button>
        <span className="small muted">You never need the parent&apos;s email: the admin team sends it.</span>
      </div>
    </section>
  );
}
