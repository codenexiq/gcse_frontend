"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { DAY_SHORT, overlap, rangeText, suggestedGroupId } from "@/lib/groups";
import { useToast } from "@/hooks/useToast";
import { assignStudentToGroup, removeStudentFromGroup } from "@/services/groupService";
import type { SessionGroup } from "@/types";
import styles from "./GroupAssign.module.css";

interface Props {
  studentId: number;
  firstName: string;
  groups: SessionGroup[];
  /** What the student needs help with (wrong topics, then not-learned topics). */
  needs: string[];
  /** The group the student is in now. */
  current: { groupId: number; note: string; sendVideo: boolean } | null;
}

/** "Choose a group", as in the prototype: pick one, write a note, and the student is told in their messages. */
export default function GroupAssign({ studentId, firstName, groups, needs, current }: Props) {
  const router = useRouter();
  const toast = useToast();
  const suggested = suggestedGroupId(groups, needs, studentId);
  const [picked, setPicked] = useState<number | null>(current?.groupId ?? suggested);
  const [note, setNote] = useState(current?.note ?? "");
  const [sendVideo, setSendVideo] = useState(current?.sendVideo ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function assign() {
    if (picked === null || busy) return;
    setBusy(true);
    setError("");
    try {
      const { group } = await assignStudentToGroup(studentId, { groupId: picked, note: note.trim(), sendVideo });
      toast.success(`${firstName} is in the ${group.name}. They have been sent the details in their messages.`, { title: "Group assigned" });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place the student. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await removeStudentFromGroup(studentId);
      toast.success(`${firstName} is out of the group and waiting for a new one.`, { title: "Removed" });
      setPicked(suggested);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove the student.");
    } finally {
      setBusy(false);
    }
  }

  if (groups.length === 0) {
    return (
      <section className={styles.card} aria-label="Place in a group">
        <h2 className={styles.legend}>Choose a group</h2>
        <p className={styles.muted}>There are no groups yet. <Link href="/tutor/dashboard/groups" className={styles.link}>Create a group</Link> first.</p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Place in a group">
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{current ? "Change group" : "Choose a group"}</legend>
        <div className={styles.list} role="radiogroup">
          {groups.map((g) => {
            const covered = overlap(g, needs);
            const here = g.members.some((m) => m.id === studentId);
            const full = g.members.length >= g.capacity && !here;
            return (
              <label key={g.id} className={`${styles.option} ${picked === g.id ? styles.on : ""} ${full ? styles.full : ""}`}>
                <input type="radio" name="group" checked={picked === g.id} onChange={() => setPicked(g.id)} disabled={full} />
                <span className={styles.body}>
                  <span className={styles.nameRow}>
                    <strong>{g.name}</strong>
                    {g.id === suggested && <span className={styles.chipNavy}>Suggested</span>}
                    {here && <span className={styles.chipGood}>Current group</span>}
                    {full && <span className={styles.chipFull}>Full</span>}
                  </span>
                  <span className={styles.small}>{DAY_SHORT[g.dayOfWeek]} {"\u00b7"} {rangeText(g.startTime, g.endTime)} {"\u00b7"} {g.members.length} {g.members.length === 1 ? "student" : "students"}</span>
                  <span className={styles.smallDark}>{covered.length ? `Covers ${covered.length} of their needs: ${covered.join(", ")}` : needs.length ? "Doesn\u2019t cover their misconceptions" : "No diagnostic result to compare"}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className={styles.field}>
        Note to {firstName}
        <textarea className={styles.area} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="e.g. Welcome! In this session we'll fix the mistakes from your diagnostic." />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={sendVideo} onChange={(e) => setSendVideo(e.target.checked)} />
        Tell them a pre-session video is coming
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={assign} disabled={busy || picked === null}>{busy ? "Saving\u2026" : current ? "Save and send update" : "Assign group and send Zoom link"}</button>
        {current && <button type="button" className={styles.plain} onClick={remove} disabled={busy}>Take out of the group</button>}
        <span className={styles.small}>{firstName} gets the date, time and Zoom link in their messages.</span>
      </div>
    </section>
  );
}
