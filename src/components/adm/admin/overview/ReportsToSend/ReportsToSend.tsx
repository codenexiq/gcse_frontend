"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import { monthName } from "@/lib/format";
import type { ReadyReport } from "@/types/admin";

/** Monthly reports the tutors have finished. The admin copies one and marks it as sent to the parent. */
export default function ReportsToSend({ reports }: { reports: ReadyReport[] }) {
  const router = useRouter();
  const toast = useToast();

  async function copy(r: ReadyReport) {
    try {
      await navigator.clipboard.writeText(r.text);
      toast("Copied");
    } catch {
      toast("Select the text to copy it.");
    }
  }

  async function markSent(r: ReadyReport) {
    try {
      await send("POST", `/admin/reports/${r.id}/sent`);
      toast("Marked as sent");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    }
  }

  return (
    <section className="card">
      <h2>
        <Icon name="notes" /> Reports to send to parents
      </h2>
      {reports.length === 0 ? (
        <p className="muted small">No reports waiting. Tutors send them here from a student&apos;s profile.</p>
      ) : (
        reports.map((r) => (
          <div className="rep" key={r.id}>
            <div className="row between">
              <strong>
                {r.studentName} · {r.pathway} · {monthName(r.month)}
              </strong>
              <span className="small muted">from {r.tutorName}</span>
            </div>
            <p className="small">{r.text}</p>
            <div className="row">
              <span className="small">
                To: <strong>{r.parent.name}</strong> &lt;{r.parent.email}&gt;
              </span>
              <button type="button" className="btn sm" onClick={() => void copy(r)}>Copy</button>
              <button type="button" className="btn primary sm" onClick={() => void markSent(r)}>Mark as sent</button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
