"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { DAY_NAMES, DAY_SHORT, nextSession, rangeText, safeHref } from "@/lib/groups";
import { useToast } from "@/hooks/useToast";
import { createGroup, deleteGroup, removeStudentFromGroup, updateGroup } from "@/services/groupService";
import type { SessionGroup, SessionGroupInput } from "@/types";
import styles from "./GroupsManager.module.css";

interface Props {
  groups: SessionGroup[];
  /** Topic names to choose from (the topics of the diagnostic questions). */
  topics: string[];
}

const blank = (): SessionGroupInput => ({ name: "", dayOfWeek: 0, startTime: "18:00", endTime: "19:00", zoomLink: "", capacity: 8, topics: [] });

/** Set up, change and delete the weekly live groups, and see who is in each. */
export default function GroupsManager({ groups: initial, topics }: Props) {
  const toast = useToast();
  const [groups, setGroups] = useState(initial);
  // null = the form is closed; id undefined = a new group
  const [editing, setEditing] = useState<{ id?: number; form: SessionGroupInput } | null>(null);
  const [extra, setExtra] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<SessionGroup | null>(null);

  const allTopics = [...new Set([...topics, ...groups.flatMap((g) => g.topics), ...(editing?.form.topics ?? [])])].sort();
  const set = <K extends keyof SessionGroupInput>(key: K, value: SessionGroupInput[K]) => setEditing((e) => (e ? { ...e, form: { ...e.form, [key]: value } } : e));
  const toggleTopic = (t: string) => editing && set("topics", editing.form.topics.includes(t) ? editing.form.topics.filter((x) => x !== t) : [...editing.form.topics, t]);

  function open(group?: SessionGroup) {
    setError("");
    setExtra("");
    setEditing(group ? { id: group.id, form: { name: group.name, dayOfWeek: group.dayOfWeek, startTime: group.startTime, endTime: group.endTime, zoomLink: group.zoomLink, capacity: group.capacity, topics: group.topics } } : { form: blank() });
  }

  function addExtra() {
    const t = extra.trim();
    if (t && editing && !editing.form.topics.includes(t)) set("topics", [...editing.form.topics, t]);
    setExtra("");
  }

  async function save() {
    if (!editing || busy) return;
    const f = editing.form;
    if (!f.name.trim()) return setError("Give the group a name.");
    if (!f.zoomLink.trim()) return setError("Add the Zoom link.");
    if (f.endTime <= f.startTime) return setError("The end time must be after the start time.");
    setBusy(true);
    setError("");
    try {
      const body = { ...f, name: f.name.trim(), zoomLink: f.zoomLink.trim(), capacity: Number(f.capacity) || 8 };
      const saved = editing.id ? await updateGroup(editing.id, body) : await createGroup(body);
      setGroups((old) => (editing.id ? old.map((g) => (g.id === saved.id ? saved : g)) : [...old, saved]).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
      toast.success(editing.id ? `"${saved.name}" is updated.` : `"${saved.name}" is created.`, { title: editing.id ? "Group saved" : "Group created" });
      setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the group. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setError("");
    try {
      await deleteGroup(deleting.id);
      setGroups((old) => old.filter((g) => g.id !== deleting.id));
      toast.success(`"${deleting.name}" is deleted. Its students are waiting for a group again.`, { title: "Group deleted" });
      setDeleting(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the group.");
    } finally {
      setBusy(false);
    }
  }

  async function takeOut(group: SessionGroup, student: { id: number; fullName: string }) {
    try {
      await removeStudentFromGroup(student.id);
      setGroups((old) => old.map((g) => (g.id === group.id ? { ...g, members: g.members.filter((m) => m.id !== student.id) } : g)));
      toast.success(`${student.fullName} is out of the group and waiting for a new one.`, { title: "Removed" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove the student.", { title: "Not changed" });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <p className={styles.intro}>Groups meet every week on Zoom. After a student finishes the diagnostic, place them in the group that fits.</p>
        {!editing && <button type="button" className={styles.primary} onClick={() => open()}><Plus size={16} aria-hidden="true" /> New group</button>}
      </div>

      {editing && (
        <section className={styles.form} aria-label={editing.id ? "Edit group" : "New group"}>
          <h2 className={styles.title}>{editing.id ? "Edit group" : "New group"}</h2>
          <div className={styles.grid}>
            <label className={`${styles.field} ${styles.wide}`}>
              <span className={styles.label}>Name <span className={styles.star}>*</span></span>
              <input className={styles.input} value={editing.form.name} onChange={(e) => set("name", e.target.value)} maxLength={100} placeholder="e.g. Thursday Algebra group" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Day</span>
              <select className={styles.input} value={editing.form.dayOfWeek} onChange={(e) => set("dayOfWeek", Number(e.target.value))}>
                {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Starts</span>
              <input className={styles.input} type="time" value={editing.form.startTime} onChange={(e) => set("startTime", e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Ends</span>
              <input className={styles.input} type="time" value={editing.form.endTime} onChange={(e) => set("endTime", e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Places</span>
              <input className={styles.input} type="number" min={1} max={30} value={editing.form.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
            </label>
            <label className={`${styles.field} ${styles.wide}`}>
              <span className={styles.label}>Zoom link <span className={styles.star}>*</span></span>
              <input className={styles.input} value={editing.form.zoomLink} onChange={(e) => set("zoomLink", e.target.value)} maxLength={300} placeholder="e.g. https://zoom.us/j/123456789" />
            </label>
          </div>

          <fieldset className={styles.topics}>
            <legend className={styles.label}>Topics this group covers</legend>
            <div className={styles.chips}>
              {allTopics.map((t) => (
                <label key={t} className={`${styles.chip} ${editing.form.topics.includes(t) ? styles.chipOn : ""}`}>
                  <input type="checkbox" checked={editing.form.topics.includes(t)} onChange={() => toggleTopic(t)} />
                  {t}
                </label>
              ))}
              {allTopics.length === 0 && <span className={styles.muted}>No topics yet. Add one below.</span>}
            </div>
            <div className={styles.addTopic}>
              <input className={styles.input} value={extra} onChange={(e) => setExtra(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExtra(); } }} maxLength={100} placeholder="Another topic" aria-label="Another topic" />
              <button type="button" className={styles.secondary} onClick={addExtra}>Add topic</button>
            </div>
          </fieldset>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={save} disabled={busy}>{busy ? "Saving…" : editing.id ? "Save changes" : "Create group"}</button>
            <button type="button" className={styles.secondary} onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
          </div>
        </section>
      )}

      {groups.length === 0 && !editing ? (
        <p className={styles.empty}>No groups yet. Create one, then place students in it from their review page.</p>
      ) : (
        <div className={styles.cards}>
          {groups.map((g) => (
            <article key={g.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.date} aria-hidden="true">
                  <span>{DAY_SHORT[g.dayOfWeek].toUpperCase()}</span>
                  <b>{nextSession(g).start.getDate()}</b>
                </div>
                <div className={styles.headText}>
                  <h3 className={styles.name}>{g.name}</h3>
                  <p className={styles.when}>{DAY_NAMES[g.dayOfWeek]}s, {rangeText(g.startTime, g.endTime)}</p>
                </div>
                <div className={styles.tools}>
                  <button type="button" className={styles.icon} onClick={() => open(g)} aria-label={`Edit ${g.name}`} title="Edit"><Pencil size={16} aria-hidden="true" /></button>
                  <button type="button" className={`${styles.icon} ${styles.danger}`} onClick={() => { setError(""); setDeleting(g); }} aria-label={`Delete ${g.name}`} title="Delete"><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </div>
              {g.topics.length > 0 && <ul className={styles.tagList}>{g.topics.map((t) => <li key={t} className={styles.tag}>{t}</li>)}</ul>}
              <p className={styles.count}>
                <strong>{g.members.length} {g.members.length === 1 ? "student" : "students"}</strong> of {g.capacity}{g.members.length > 0 && ":"}
              </p>
              {g.members.length > 0 && (
                <ul className={styles.members}>
                  {g.members.map((m) => (
                    <li key={m.id} className={styles.member}>
                      <span>{m.fullName}</span>
                      <button type="button" className={styles.out} onClick={() => takeOut(g, m)} aria-label={`Take ${m.fullName} out of ${g.name}`} title="Take out of the group"><X size={14} aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>
              )}
              {safeHref(g.zoomLink) && (
                <div className={styles.actions}>
                  <a href={safeHref(g.zoomLink)} target="_blank" rel="noopener noreferrer" className={styles.primary}>Start Zoom</a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog open={deleting !== null} title="Delete this group?" busy={busy} error={error} actions={[{ label: "Delete group", tone: "danger", onClick: remove }]} onClose={() => setDeleting(null)}>
        <p>{deleting ? `"${deleting.name}" is deleted. ${deleting.members.length ? `${deleting.members.length} student${deleting.members.length === 1 ? " goes" : "s go"} back to waiting for a group.` : ""}` : ""}</p>
      </ConfirmDialog>
    </div>
  );
}
