"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useToast } from "@/components/adm/ui/Toast";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { DAYS } from "@/lib/icons";
import { plural } from "@/lib/format";
import type { Group, Lookups } from "@/types/admin";

type Edit = Pick<Group, "name" | "subjectId" | "levelId" | "tutorId" | "day" | "start" | "zoom">;

/** One live-class group: name, pathway, tutor, day, time and Zoom link. Changes save as you go. */
export default function GroupCard({ group, index, lookups }: { group: Group; index: number; lookups: Lookups }) {
  const toast = useToast();
  const [g, setG] = useState(group);
  const save = useAutosave((edit: Edit) => send("PUT", `/admin/people/groups/${g.id}`, edit));

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...g, ...patch };
    setG(next);
    save({ name: next.name, subjectId: next.subjectId, levelId: next.levelId, tutorId: next.tutorId, day: next.day, start: next.start, zoom: next.zoom }, now);
  }

  const subject = lookups.subjects.find((s) => s.id === g.subjectId);
  const paths = lookups.subjects.flatMap((s) => s.levels.map((l) => ({ value: `${s.id}|${l}`, label: `${lookups.levels.find((x) => x.id === l)?.short ?? l} ${s.name}` })));

  async function addSessions() {
    try {
      const { added } = await send<{ added: number }>("POST", `/admin/people/groups/${g.id}/sessions`);
      toast(`${plural(added, "session")} added`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add the sessions.");
    }
  }

  return (
    <section className="card">
      <div className="row">
        <SubjectBadge icon={subject?.icon ?? "book"} color={subject?.color ?? "#4B596A"} />
        <strong>{g.name}</strong>
        <span className="small muted">{plural(g.students, "student")}</span>
      </div>
      <div className="form-grid">
        <Field id={`gr-n-${index}`} label="Name">
          <input id={`gr-n-${index}`} type="text" value={g.name} onChange={(e) => change({ name: e.target.value })} />
        </Field>
        <Field id={`gr-p-${index}`} label="Pathway">
          <select
            id={`gr-p-${index}`}
            value={`${g.subjectId}|${g.levelId}`}
            onChange={(e) => {
              const [subjectId, levelId] = e.target.value.split("|");
              change({ subjectId, levelId }, true);
            }}
          >
            {paths.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
        <Field id={`gr-t-${index}`} label="Tutor">
          <select id={`gr-t-${index}`} value={g.tutorId ?? ""} onChange={(e) => change({ tutorId: e.target.value ? Number(e.target.value) : null }, true)}>
            <option value="">Choose tutor…</option>
            {lookups.tutors
              .filter((t) => t.subjects.includes(g.subjectId))
              .map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
          </select>
        </Field>
        <Field id={`gr-d-${index}`} label="Day">
          <select id={`gr-d-${index}`} value={g.day} onChange={(e) => change({ day: Number(e.target.value) }, true)}>
            {DAYS.map((d, k) => (
              <option key={d} value={k}>{d}</option>
            ))}
          </select>
        </Field>
        <Field id={`gr-s-${index}`} label="Time">
          <input id={`gr-s-${index}`} type="time" value={g.start} onChange={(e) => e.target.value && change({ start: e.target.value })} />
        </Field>
        <Field id={`gr-z-${index}`} label="Zoom link">
          <input id={`gr-z-${index}`} type="text" value={g.zoom} onChange={(e) => change({ zoom: e.target.value })} />
        </Field>
      </div>
      <div className="row">
        <button type="button" className="btn sm" onClick={() => void addSessions()}>Add next 6 weeks to the calendar</button>
      </div>
    </section>
  );
}
