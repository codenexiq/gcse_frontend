"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { deleteEnquiry, setEnquiryStatus } from "@/services/siteService";
import { formatDate } from "@/utils/formatDate";
import type { Enquiry, EnquiryStatus } from "@/types";
import styles from "./EnquiriesInbox.module.css";

const STATUS_LABEL: Record<EnquiryStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

/** The messages from the website's contact form, newest first. An admin marks each one as new, contacted or closed. */
export default function EnquiriesInbox({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<number | null>(null);

  async function changeStatus(id: number, status: EnquiryStatus) {
    setBusy(id);
    try {
      await setEnquiryStatus(id, status);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the status");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this enquiry for good?")) return;
    setBusy(id);
    try {
      await deleteEnquiry(id);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the enquiry");
    } finally {
      setBusy(null);
    }
  }

  if (enquiries.length === 0) return <p className={styles.empty}>No messages yet. When someone fills in the contact form on the website, it appears here.</p>;

  return (
    <section className={styles.panel} aria-label="Website enquiries">
      {enquiries.map((e) => (
        <article key={e.id} className={`${styles.card} ${e.status === "new" ? styles.new : ""}`}>
          <div className={styles.top}>
            <p className={styles.names}>
              {e.parentName} <span className={styles.when}>for {e.studentName}</span>
            </p>
            <span className={styles.when}>{formatDate(e.createdAt)}</span>
          </div>
          <div className={styles.meta}>
            <a href={`mailto:${e.email}`}>{e.email}</a>
            {e.phone && <span>{e.phone}</span>}
          </div>
          <div className={styles.chips}>
            <span className={styles.chip}>{e.yearGroup}</span>
            <span className={styles.chip}>{e.subject}</span>
          </div>
          {e.message && <p className={styles.message}>{e.message}</p>}
          <div className={styles.actions}>
            <select
              className={styles.select}
              aria-label="Status"
              value={e.status}
              disabled={busy === e.id}
              onChange={(ev) => changeStatus(e.id, ev.target.value as EnquiryStatus)}
            >
              {(Object.keys(STATUS_LABEL) as EnquiryStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <button type="button" className={styles.delete} disabled={busy === e.id} onClick={() => remove(e.id)}>Delete</button>
          </div>
        </article>
      ))}
    </section>
  );
}
