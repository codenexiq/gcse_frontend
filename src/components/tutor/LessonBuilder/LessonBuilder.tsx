"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CircleHelp, PenLine, Play } from "lucide-react";
import MathText from "@/components/ui/MathText";
import RichText from "@/components/lessons/RichText";
import LessonAddCard from "@/components/tutor/LessonAddCard";
import LessonAiTools from "@/components/tutor/LessonAiTools";
import { ADD_TYPES, TYPE_LABEL, newBlock } from "@/lib/lessons";
import { createLesson, deleteLesson, lessonOverview, lessonsForTopic, saveLesson } from "@/services/lessonService";
import type { LessonBlock, LessonStrand, TutorLesson } from "@/types";
import styles from "./LessonBuilder.module.css";

const ICONS = { slide: BookOpen, video: Play, mcq: CircleHelp, written: PenLine };

interface Props {
  strands: LessonStrand[];
  topic: string;
  lessons: TutorLesson[];
  /** The lesson to open first (from the address). */
  lessonId: number | null;
}

/** The lesson builder, as in the prototype: the topics on the left; on the right a topic's lessons and the blocks of the lesson being edited. */
export default function LessonBuilder({ strands: initialStrands, topic: initialTopic, lessons: initialLessons, lessonId }: Props) {
  const [strands, setStrands] = useState(initialStrands);
  const [topic, setTopic] = useState(initialTopic);
  const [lessons, setLessons] = useState(initialLessons);
  const [currentId, setCurrentId] = useState<number | null>(lessonId && initialLessons.some((l) => l.id === lessonId) ? lessonId : (initialLessons[0]?.id ?? null));
  const [draft, setDraft] = useState<TutorLesson | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState("");

  // The lesson being edited is a copy: nothing is saved until Save is pressed.
  useEffect(() => {
    const found = lessons.find((l) => l.id === currentId) ?? null;
    setDraft(found ? { ...found, blocks: found.blocks.map((b) => ({ ...b })) } : null);
    setDirty(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");
  }, [currentId, lessons]);

  const strandOfTopic = strands.find((s) => s.topics.some((t) => t.name === topic))?.name ?? "";

  function leaveOk() {
    return !dirty || window.confirm("You have changes that are not saved. Leave without saving?");
  }

  async function chooseTopic(next: string) {
    if (next === topic || !leaveOk()) return;
    setError("");
    setNotice("");
    try {
      const list = await lessonsForTopic(next);
      setTopic(next);
      setLessons(list);
      setCurrentId(list[0]?.id ?? null);
      window.history.replaceState(null, "", `/tutor/dashboard/lessons?topic=${encodeURIComponent(next)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that topic.");
    }
  }

  function chooseLesson(id: number) {
    if (id === currentId || !leaveOk()) return;
    setCurrentId(id);
  }

  async function refreshCounts() {
    try {
      setStrands(await lessonOverview());
    } catch {
      // The counts catch up next time.
    }
  }

  async function addLesson() {
    if (!leaveOk()) return;
    setError("");
    try {
      const made = await createLesson(topic, "New lesson");
      setLessons((old) => [...old, made]);
      setCurrentId(made.id);
      void refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the lesson.");
    }
  }

  function change(next: TutorLesson) {
    setDraft(next);
    setDirty(true);
    setMessage("");
  }

  function setBlock(id: string, patch: Partial<LessonBlock>) {
    if (!draft) return;
    change({ ...draft, blocks: draft.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as LessonBlock) : b)) });
  }

  function move(index: number, by: number) {
    if (!draft) return;
    const blocks = [...draft.blocks];
    const [item] = blocks.splice(index, 1);
    blocks.splice(index + by, 0, item);
    change({ ...draft, blocks });
  }

  function addAt(index: number, type: LessonBlock["type"]) {
    if (!draft) return;
    const blocks = [...draft.blocks];
    blocks.splice(index, 0, newBlock(type));
    change({ ...draft, blocks });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const saved = await saveLesson(draft.id, { title: draft.title.trim() || "Untitled lesson", published: draft.published, blocks: draft.blocks });
      setLessons((old) => old.map((l) => (l.id === saved.id ? saved : l)));
      setDirty(false);
      setMessage(draft.published && draft.blocks.length === 0 ? "Saved. A lesson with no blocks stays hidden from students." : "Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft) return;
    setError("");
    try {
      await deleteLesson(draft.id);
      const rest = lessons.filter((l) => l.id !== draft.id);
      setLessons(rest);
      setCurrentId(rest[0]?.id ?? null);
      void refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the lesson.");
    }
  }

  const counts = useMemo(() => {
    const blocks = draft?.blocks ?? [];
    return { slides: blocks.filter((b) => b.type === "slide").length, questions: blocks.filter((b) => b.type === "mcq" || b.type === "written").length, videos: blocks.filter((b) => b.type === "video").length };
  }, [draft]);

  return (
    <div className={styles.grid}>
      <div className={styles.navCard}>
        <nav className={styles.nav} aria-label="Topics">
          {strands.map((st) => (
            <div key={st.name} className={styles.strand}>
              <span className={styles.label}>{st.name}</span>
              {st.topics.map((t) => (
                <button key={t.name} type="button" className={styles.topicBtn} aria-current={t.name === topic} onClick={() => void chooseTopic(t.name)}>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                  {t.count > 0 && <span className={`${styles.chip} ${styles.blue}`}>{t.count} lesson{t.count > 1 ? "s" : ""}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.main}>
        <div className={styles.head}>
          <div>
            <span className={styles.label}>{strandOfTopic}</span>
            <h2 className={styles.h2}>{topic}</h2>
            <p className={styles.small}>Lessons here appear under {topic} on every student&rsquo;s learning map.</p>
          </div>
          <button type="button" className={styles.btn} onClick={() => void addLesson()}>New lesson</button>
        </div>

        {lessons.length > 0 && (
          <div className={styles.tabs}>
            {lessons.map((l) => (
              <button key={l.id} type="button" className={styles.tab} aria-current={l.id === currentId ? "page" : undefined} onClick={() => chooseLesson(l.id)}>{l.title || "Untitled"}</button>
            ))}
          </div>
        )}

        <LessonAddCard
          topic={topic}
          strands={strands}
          onCreated={(lesson, note) => {
            setLessons((old) => [...old, lesson]);
            setCurrentId(lesson.id);
            setNotice(note);
            void refreshCounts();
            window.scrollTo(0, 0);
          }}
        />

        {notice && <p className={styles.status} role="status">{notice}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}

        {!draft ? (
          <>
          <div className={styles.card}>
            <h2 className={styles.h2}>No lessons for {topic} yet</h2>
            <p className={styles.muted}>Start a lesson from scratch, or upload a PowerPoint and let AI turn it into slides with questions between them.</p>
            <div className={styles.row}>
              <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => void addLesson()}>Create a lesson</button>
            </div>
          </div>
          <LessonAiTools
            topic={topic}
            slides={[]}
            onAdd={async (blocks) => {
              try {
                const made = await createLesson(topic, "New lesson");
                const saved = await saveLesson(made.id, { title: `Lesson: ${topic}`, published: false, blocks });
                setLessons((old) => [...old, saved]);
                setCurrentId(saved.id);
                setNotice("Lesson made from your slides. Read it, then tick Visible to students.");
                void refreshCounts();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create the lesson.");
              }
            }}
            onInsertQuestions={() => {}}
          />
          </>
        ) : (
          <>
            <div className={styles.card}>
              <label className={styles.field}>
                Lesson title
                <input type="text" value={draft.title} maxLength={150} onChange={(e) => change({ ...draft, title: e.target.value })} />
              </label>
              <div className={`${styles.row} ${styles.between}`}>
                <div className={styles.row}>
                  <span className={`${styles.chip} ${styles.cream}`}>{counts.slides} slide{counts.slides === 1 ? "" : "s"}</span>
                  <span className={`${styles.chip} ${styles.blue}`}>{counts.questions} question{counts.questions === 1 ? "" : "s"}</span>
                  {counts.videos > 0 && <span className={`${styles.chip} ${styles.lav}`}>{counts.videos} video{counts.videos === 1 ? "" : "s"}</span>}
                </div>
                <div className={styles.row}>
                  <label className={styles.choice}>
                    <input type="checkbox" checked={draft.published} onChange={(e) => change({ ...draft, published: e.target.checked })} /> Visible to students
                  </label>
                  {draft.blocks.length > 0 && !dirty ? (
                    <Link href={`/tutor/dashboard/lessons/preview/${draft.id}`} className={styles.btn}>Preview as student</Link>
                  ) : (
                    <button type="button" className={styles.btn} disabled title={draft.blocks.length === 0 ? "Add a block first" : "Save your changes first"}>Preview as student</button>
                  )}
                  <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={!dirty || saving} onClick={() => void save()}>{saving ? "Saving..." : "Save lesson"}</button>
                </div>
              </div>
              {(dirty || message) && <p className={styles.status} role="status">{dirty ? "You have changes that are not saved." : message}</p>}
            </div>

            <LessonAiTools
              topic={topic}
              slides={draft.blocks.flatMap((b) => (b.type === "slide" ? [{ title: b.title, body: b.body }] : []))}
              onAdd={(blocks) => change({ ...draft, blocks: [...draft.blocks, ...blocks] })}
              onInsertQuestions={(questions) => {
                // Each question goes straight after the slide it is about (the slide number counts slides only).
                const out: LessonBlock[] = [];
                let slideNumber = 0;
                for (const b of draft.blocks) {
                  out.push(b);
                  if (b.type === "slide") {
                    slideNumber += 1;
                    for (const q of questions) if (q.after === slideNumber) out.push(q.block);
                  }
                }
                change({ ...draft, blocks: out });
              }}
            />

            {draft.blocks.map((b, i) => {
              const Icon = ICONS[b.type];
              return (
                <section key={b.id} className={styles.blk} aria-label={`Block ${i + 1}`}>
                  <div className={`${styles.row} ${styles.between}`}>
                    <div className={styles.row}>
                      <span className={`${styles.icon} ${styles[b.type]}`}><Icon size={18} aria-hidden="true" /></span>
                      <strong>{i + 1}. {TYPE_LABEL[b.type]}</strong>
                    </div>
                    <div className={styles.tools}>
                      <button type="button" className={styles.ghost} disabled={i === 0} aria-label={`Move block ${i + 1} up`} onClick={() => move(i, -1)}>Up</button>
                      <button type="button" className={styles.ghost} disabled={i === draft.blocks.length - 1} aria-label={`Move block ${i + 1} down`} onClick={() => move(i, 1)}>Down</button>
                      <button type="button" className={styles.ghost} onClick={() => change({ ...draft, blocks: draft.blocks.filter((x) => x.id !== b.id) })}>Remove</button>
                    </div>
                  </div>

                  {b.type === "slide" && (
                    <>
                      <label className={styles.field}>Heading<input type="text" value={b.title} onChange={(e) => setBlock(b.id, { title: e.target.value })} /></label>
                      <label className={styles.field}>
                        <span>Content <span className={styles.hint}>Leave a blank line between paragraphs. Write maths in LaTeX inside $&hellip;$, e.g. $\frac&#123;3&#125;&#123;4&#125;$ or $x^2$. Use $$&hellip;$$ for a line on its own.</span></span>
                        <textarea rows={7} value={b.body} onChange={(e) => setBlock(b.id, { body: e.target.value })} />
                      </label>
                      <Preview><RichText text={b.body} /></Preview>
                    </>
                  )}

                  {b.type === "video" && (
                    <>
                      <label className={styles.field}>Title<input type="text" value={b.title} onChange={(e) => setBlock(b.id, { title: e.target.value })} /></label>
                      <label className={styles.field}>
                        <span>Video link <span className={styles.hint}>YouTube, Vimeo or Google Drive (a web address).</span></span>
                        <input type="url" value={b.url} onChange={(e) => setBlock(b.id, { url: e.target.value })} />
                      </label>
                      <label className={styles.field}>Note for students<textarea rows={3} value={b.note} onChange={(e) => setBlock(b.id, { note: e.target.value })} /></label>
                    </>
                  )}

                  {b.type === "mcq" && (
                    <>
                      <label className={styles.field}>
                        <span>Question <span className={styles.hint}>Maths goes inside $&hellip;$.</span></span>
                        <textarea rows={3} value={b.question} onChange={(e) => setBlock(b.id, { question: e.target.value })} />
                      </label>
                      <Preview><MathText text={b.question} /></Preview>
                      <fieldset className={styles.fieldset}>
                        <legend>Options <span className={styles.hint}>Tick the correct one</span></legend>
                        <div className={styles.options}>
                          {b.options.map((o, k) => (
                            <div key={k} className={styles.optRow}>
                              <input type="radio" name={`correct-${b.id}`} checked={b.correct === k} aria-label={`Option ${"ABCD"[k]} is correct`} onChange={() => setBlock(b.id, { correct: k })} />
                              <span className={styles.letter} aria-hidden="true">{"ABCD"[k]}</span>
                              <input type="text" aria-label={`Option ${"ABCD"[k]}`} value={o} onChange={(e) => setBlock(b.id, { options: b.options.map((x, j) => (j === k ? e.target.value : x)) })} />
                            </div>
                          ))}
                        </div>
                      </fieldset>
                      <label className={styles.field}>Explanation shown after answering<textarea rows={3} value={b.explain} onChange={(e) => setBlock(b.id, { explain: e.target.value })} /></label>
                    </>
                  )}

                  {b.type === "written" && (
                    <>
                      <label className={styles.field}>
                        <span>Question <span className={styles.hint}>Maths goes inside $&hellip;$.</span></span>
                        <textarea rows={3} value={b.question} onChange={(e) => setBlock(b.id, { question: e.target.value })} />
                      </label>
                      <Preview><MathText text={b.question} /></Preview>
                      <label className={styles.field}>
                        <span>Mark scheme <span className={styles.hint}>What earns each mark. Students see it after they answer and mark themselves.</span></span>
                        <textarea rows={3} value={b.markScheme} onChange={(e) => setBlock(b.id, { markScheme: e.target.value })} />
                      </label>
                      <label className={styles.field}>Marks<input type="number" min={1} max={6} style={{ maxWidth: 120 }} value={b.marks} onChange={(e) => setBlock(b.id, { marks: Math.max(1, Math.min(6, Number(e.target.value) || 1)) })} /></label>
                    </>
                  )}

                  {b.type === "slide" && (
                    <div><button type="button" className={styles.ghost} onClick={() => addAt(i + 1, "mcq")}>+ Add a quiz question after this slide</button></div>
                  )}
                </section>
              );
            })}

            <div className={styles.card} style={{ gap: 10 }}>
              <strong>Add to the end of this lesson</strong>
              <div className={styles.row}>
                {ADD_TYPES.map((t) => <button key={t.type} type="button" className={styles.btn} onClick={() => addAt(draft.blocks.length, t.type)}>+ {t.label}</button>)}
              </div>
            </div>

            <div className={styles.row}>
              {confirmDelete ? (
                <>
                  <span>Delete &ldquo;{draft.title}&rdquo; for good?</span>
                  <button type="button" className={styles.btn} onClick={() => void remove()}>Delete lesson</button>
                  <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(false)}>Keep it</button>
                </>
              ) : (
                <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(true)}>Delete this lesson</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.previewWrap}>
      <span className={styles.label}>How students see it</span>
      <div className={styles.preview}>{children}</div>
    </div>
  );
}
