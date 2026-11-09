"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { startPractice } from "@/services/lessonService";

interface Props {
  topic: string;
  className: string;
  label: string;
  /** For screen readers, e.g. "Practise Fractions". */
  ariaLabel?: string;
}

/** Makes a fresh set of practice questions on a topic and opens it. Shows why when the AI helper is not switched on. */
export default function PractiseButton({ topic, className, label, ariaLabel }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function go() {
    setBusy(true);
    setNote("");
    try {
      router.push(`/student/learning-map/practice/${(await startPractice(topic)).id}`);
    } catch (err) {
      setNote(err instanceof ApiError && err.status === 503 ? "Practice questions are not switched on yet." : err instanceof Error ? err.message : "Could not make questions.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} disabled={busy} aria-label={ariaLabel} title={note || undefined} onClick={() => void go()}>
        {busy ? "Making..." : label}
      </button>
      {note && <span role="status" style={{ fontSize: 12 }}>{note}</span>}
    </>
  );
}
