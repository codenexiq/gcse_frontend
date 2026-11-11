"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import type { Enrolment, Lookups, StudentDetail } from "@/types/admin";

interface Props {
  student: StudentDetail;
  lookups: Lookups;
  onEdit: (enrolmentId: number, patch: Partial<Pick<Enrolment, "tier" | "board" | "current" | "target" | "tutorId" | "groupId">>) => void;
  onRemove: (enrolmentId: number) => void;
  onAdd: (subjectId: string) => void;
}

/** The subjects a student studies, each with tier, exam board, grades, tutor and group; and a way to add another subject. */
export default function StudentSubjects({ student, lookups, onEdit, onRemove, onAdd }: Props) {
  const [removing, setRemoving] = useState<number | null>(null);
  const [adding, setAdding] = useState("");
  const level = lookups.levels.find((l) => l.id === student.level);
  const available = lookups.subjects.filter((x) => x.levels.includes(student.level) && !student.enrolments.some((e) => e.subjectId === x.id && e.levelId === student.level));

  return (
    <section className="card">
      <h2>
        <Icon name="book" /> Subjects
      </h2>
      {student.enrolments.length === 0 ? (
        <p className="muted small">No subjects yet.</p>
      ) : (
        student.enrolments.map((e, j) => {
          const el = lookups.levels.find((l) => l.id === e.levelId);
          const subject = lookups.subjects.find((s) => s.id === e.subjectId);
          return (
            <div className="enrol" key={e.id}>
              <SubjectBadge icon={subject?.icon ?? "book"} color={subject?.color ?? "#4B596A"} />
              <div className="stack grow">
                <strong>{e.pathName}</strong>
                <div className="form-grid">
                  {el && el.tiers.length > 0 && (
                    <Field id={`ae-tier-${j}`} label="Tier">
                      <select id={`ae-tier-${j}`} value={e.tier} onChange={(ev) => onEdit(e.id, { tier: ev.target.value })}>
                        {el.tiers.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {el && el.boards.length > 0 && (
                    <Field id={`ae-board-${j}`} label="Exam board">
                      <select id={`ae-board-${j}`} value={e.board} onChange={(ev) => onEdit(e.id, { board: ev.target.value })}>
                        <option value="">Not sure</option>
                        {el.boards.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field id={`ae-cur-${j}`} label="Current">
                    <select id={`ae-cur-${j}`} value={e.current} onChange={(ev) => onEdit(e.id, { current: ev.target.value })}>
                      <option value="">–</option>
                      {(el?.grades ?? []).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id={`ae-tgt-${j}`} label="Target">
                    <select id={`ae-tgt-${j}`} value={e.target} onChange={(ev) => onEdit(e.id, { target: ev.target.value })}>
                      <option value="">–</option>
                      {(el?.grades ?? []).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id={`ae-tut-${j}`} label="Tutor">
                    <select id={`ae-tut-${j}`} value={e.tutorId ?? ""} onChange={(ev) => onEdit(e.id, { tutorId: ev.target.value ? Number(ev.target.value) : null })}>
                      <option value="">Choose tutor…</option>
                      {lookups.tutors
                        .filter((t) => t.subjects.includes(e.subjectId))
                        .map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                  </Field>
                  <Field id={`ae-grp-${j}`} label="Group">
                    <select id={`ae-grp-${j}`} value={e.groupId ?? ""} onChange={(ev) => onEdit(e.id, { groupId: ev.target.value ? Number(ev.target.value) : null })}>
                      <option value="">No group</option>
                      {lookups.groups
                        .filter((g) => g.subjectId === e.subjectId && g.levelId === e.levelId)
                        .map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                  </Field>
                </div>
              </div>
              {removing === e.id ? (
                <>
                  <button type="button" className="btn sm" onClick={() => { setRemoving(null); onRemove(e.id); }}>Remove</button>
                  <button type="button" className="btn ghost sm" onClick={() => setRemoving(null)}>Keep</button>
                </>
              ) : (
                <button type="button" className="btn ghost sm" aria-label="Remove subject" onClick={() => setRemoving(e.id)}>✕</button>
              )}
            </div>
          );
        })
      )}
      {available.length > 0 && (
        <div className="row add-step">
          <Field id="a-addsub" label="Add a subject">
            <select id="a-addsub" value={adding} onChange={(e) => setAdding(e.target.value)}>
              <option value="">Choose…</option>
              {available.map((x) => (
                <option key={x.id} value={x.id}>
                  {level?.short} {x.name}
                </option>
              ))}
            </select>
          </Field>
          <button type="button" className="btn primary sm" onClick={() => { if (adding) { onAdd(adding); setAdding(""); } }}>Add</button>
        </div>
      )}
    </section>
  );
}
