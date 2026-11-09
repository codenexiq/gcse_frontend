"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { createRoute, deleteRoute, saveRoute } from "@/services/routeService";
import type { LearningRoute, RouteLibraryItem, StudentSummary } from "@/types";
import styles from "./RouteBuilder.module.css";

interface Props {
  routes: LearningRoute[];
  library: RouteLibraryItem[];
  students: StudentSummary[];
}

type Step = { type: "lesson" | "quiz"; id: number; week: number };

/** Learning routes, as in the prototype: the routes on the left; on the right the name, the steps (each with a week), and the students who have it. */
export default function RouteBuilder({ routes: initial, library, students }: Props) {
  const [routes, setRoutes] = useState(initial);
  const [currentId, setCurrentId] = useState<number | null>(initial[0]?.id ?? null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [assigned, setAssigned] = useState<number[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const current = routes.find((r) => r.id === currentId) ?? null;

  // The route being edited is a copy: nothing is saved until Save is pressed.
  useEffect(() => {
    setName(current?.name ?? "");
    setDescription(current?.description ?? "");
    setSteps(current?.steps.map((s) => ({ type: s.type, id: s.itemId, week: s.week })) ?? []);
    setAssigned(current?.assigned ?? []);
    setDirty(false);
    setMessage("");
    setError("");
    setConfirmDelete(false);
  }, [current]);

  const lookup = useMemo(() => new Map(library.map((i) => [`${i.type}-${i.id}`, i])), [library]);

  function touch<T>(set: (v: T) => void, value: T) {
    set(value);
    setDirty(true);
    setMessage("");
  }

  function leaveOk() {
    return !dirty || window.confirm("You have changes that are not saved. Leave without saving?");
  }

  function choose(id: number) {
    if (id !== currentId && leaveOk()) setCurrentId(id);
  }

  async function add(copyFrom?: LearningRoute) {
    if (!leaveOk()) return;
    setError("");
    try {
      const made = await createRoute(copyFrom ? `${copyFrom.name} (copy)` : "New route", copyFrom?.description ?? "");
      let result = made;
      if (copyFrom) result = await saveRoute(made.id, { name: made.name, description: made.description, steps: copyFrom.steps.map((s) => ({ type: s.type, id: s.itemId, week: s.week })), assigned: [] });
      setRoutes((old) => [...old, result].sort((a, b) => a.name.localeCompare(b.name)));
      setCurrentId(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the route.");
    }
  }

  async function save() {
    if (!current) return;
    setSaving(true);
    setError("");
    try {
      const saved = await saveRoute(current.id, { name: name.trim() || "Untitled route", description, steps, assigned });
      setRoutes((old) => old.map((r) => (r.id === saved.id ? saved : r)).sort((a, b) => a.name.localeCompare(b.name)));
      setDirty(false);
      const newlyAssigned = assigned.filter((id) => !current.assigned.includes(id)).length;
      setMessage(newlyAssigned > 0 ? `Saved. ${newlyAssigned} student${newlyAssigned === 1 ? " was" : "s were"} sent a message about it.` : "Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the route.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!current) return;
    setError("");
    try {
      await deleteRoute(current.id);
      const rest = routes.filter((r) => r.id !== current.id);
      setRoutes(rest);
      setCurrentId(rest[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the route.");
    }
  }

  function move(index: number, by: number) {
    const next = [...steps];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    touch(setSteps, next);
  }

  function addStep() {
    const item = library.find((i) => `${i.type}-${i.id}` === adding);
    if (!item) return;
    touch(setSteps, [...steps, { type: item.type, id: item.id, week: Math.min(12, Math.max(1, steps.at(-1)?.week ?? 1)) }]);
    setAdding("");
  }

  const topics = [...new Set(library.filter((i) => i.type === "lesson").map((i) => i.topic ?? ""))];

  return (
    <div className={styles.grid}>
      <div className={styles.left}>
        {routes.map((r) => (
          <button key={r.id} type="button" className={styles.listBtn} aria-current={r.id === currentId} onClick={() => choose(r.id)}>
            <strong>{r.name}</strong>
            <span className={styles.small}>{r.steps.length} steps &middot; {r.assigned.length} student{r.assigned.length === 1 ? "" : "s"}</span>
          </button>
        ))}
        <button type="button" className={styles.btn} onClick={() => void add()}>+ New route</button>
        <p className={styles.small}>A route is an ordered path of lessons and quizzes. Build it once and reuse it with any student.</p>
      </div>

      <div className={styles.main}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!current ? (
          <div className={styles.card}>
            <h2 className={styles.h2}>No routes yet</h2>
            <p className={styles.muted}>Make a route, add lessons and quizzes to it, then give it to your students.</p>
          </div>
        ) : (
          <>
            <div className={styles.card}>
              <label className={styles.field}>Route name<input type="text" value={name} maxLength={120} onChange={(e) => touch(setName, e.target.value)} /></label>
              <label className={styles.field}>What it&rsquo;s for<input type="text" value={description} maxLength={300} onChange={(e) => touch(setDescription, e.target.value)} /></label>
              <div className={styles.row}>
                <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={!dirty || saving} onClick={() => void save()}>{saving ? "Saving..." : "Save route"}</button>
                <button type="button" className={styles.btn} onClick={() => void add(current)}>Duplicate route</button>
                {confirmDelete ? (
                  <>
                    <span className={styles.small}>Delete this route?</span>
                    <button type="button" className={styles.btn} onClick={() => void remove()}>Delete</button>
                    <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(false)}>Keep</button>
                  </>
                ) : (
                  <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(true)}>Delete route</button>
                )}
              </div>
              {(dirty || message) && <p className={styles.status} role="status">{dirty ? "You have changes that are not saved." : message}</p>}
            </div>

            <div className={styles.card}>
              <h3 className={styles.h3}>Steps</h3>
              {steps.length === 0 ? (
                <p className={`${styles.muted} ${styles.small}`}>No steps yet. Add lessons or quizzes from your content library below.</p>
              ) : (
                <ol className={styles.steps}>
                  {steps.map((s, i) => {
                    const item = lookup.get(`${s.type}-${s.id}`);
                    const Icon = s.type === "lesson" ? BookOpen : ListChecks;
                    return (
                      <li key={`${s.type}-${s.id}-${i}`} className={styles.step}>
                        <span className={styles.num}>{i + 1}</span>
                        <span className={`${styles.icon} ${s.type === "lesson" ? styles.lesson : styles.quiz}`}><Icon size={16} aria-hidden="true" /></span>
                        <div className={styles.stepText}>
                          <strong>{item?.title ?? "Removed item"}</strong>
                          <span className={styles.small}>{s.type === "lesson" ? "Lesson" : "Quiz"}{item?.topic ? ` · ${item.topic}` : ""}{item && !item.published ? " · hidden from students" : ""}</span>
                        </div>
                        <select aria-label={`Week for step ${i + 1}`} className={styles.week} value={s.week} onChange={(e) => touch(setSteps, steps.map((x, j) => (j === i ? { ...x, week: Number(e.target.value) } : x)))}>
                          {Array.from({ length: 12 }, (_, w) => <option key={w + 1} value={w + 1}>Week {w + 1}</option>)}
                        </select>
                        <div className={styles.tools}>
                          <button type="button" className={styles.ghost} disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}>&uarr;</button>
                          <button type="button" className={styles.ghost} disabled={i === steps.length - 1} aria-label="Move down" onClick={() => move(i, 1)}>&darr;</button>
                          <button type="button" className={styles.ghost} aria-label="Remove" onClick={() => touch(setSteps, steps.filter((_, j) => j !== i))}>&times;</button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              <div className={`${styles.row} ${styles.addRow}`}>
                <label className={`${styles.field} ${styles.grow}`}>
                  Add from the content library
                  <select value={adding} onChange={(e) => setAdding(e.target.value)}>
                    <option value="">Choose a lesson or quiz...</option>
                    {topics.map((t) => (
                      <optgroup key={t} label={t}>
                        {library.filter((i) => i.type === "lesson" && (i.topic ?? "") === t).map((i) => <option key={i.id} value={`lesson-${i.id}`}>Lesson: {i.title}</option>)}
                      </optgroup>
                    ))}
                    {library.some((i) => i.type === "quiz") && (
                      <optgroup label="Quizzes">
                        {library.filter((i) => i.type === "quiz").map((i) => <option key={i.id} value={`quiz-${i.id}`}>Quiz: {i.title}</option>)}
                      </optgroup>
                    )}
                  </select>
                </label>
                <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={!adding} onClick={addStep}>Add step</button>
              </div>
              <p className={`${styles.small} ${styles.muted}`}>Need something new? Build it in <Link href="/tutor/dashboard/lessons">Lessons</Link> or <Link href="/tutor/dashboard/quizzes">Quizzes</Link>.</p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.h3}>Assigned to</h3>
              {students.length === 0 ? (
                <p className={`${styles.muted} ${styles.small}`}>There are no students yet.</p>
              ) : (
                <div className={styles.row}>
                  {students.map((s) => (
                    <label key={s.id} className={styles.choice}>
                      <input type="checkbox" checked={assigned.includes(s.id)} onChange={(e) => touch(setAssigned, e.target.checked ? [...assigned, s.id] : assigned.filter((id) => id !== s.id))} />
                      {s.full_name || s.email}
                    </label>
                  ))}
                </div>
              )}
              <p className={`${styles.small} ${styles.muted}`}>Each step shows on the student&rsquo;s task list, due at the end of its week counted from the day the route was assigned.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
