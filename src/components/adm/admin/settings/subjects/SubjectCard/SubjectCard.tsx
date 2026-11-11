"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { SUBJECT_ICONS } from "@/lib/icons";
import type { Level, SubjectWithUse } from "@/types/admin";

type Edit = Pick<SubjectWithUse, "name" | "color" | "icon" | "levels">;

/** One subject: name, colour, icon and which levels offer it. A subject that is in use cannot be deleted. */
export default function SubjectCard({ subject, index, levels, onDelete }: { subject: SubjectWithUse; index: number; levels: Level[]; onDelete: (id: string) => void }) {
  const [s, setS] = useState(subject);
  const [confirming, setConfirming] = useState(false);
  const save = useAutosave((edit: Edit) => send("PUT", `/admin/settings/subjects/${s.id}`, edit));

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...s, ...patch };
    setS(next);
    save({ name: next.name, color: next.color, icon: next.icon, levels: next.levels }, now);
  }

  return (
    <section className="card">
      <div className="row between">
        <div className="row">
          <SubjectBadge icon={s.icon} color={s.color} size="lg" />
          <h3>{s.name}</h3>
        </div>
        {s.inUse ? (
          <span className="small muted">In use</span>
        ) : confirming ? (
          <>
            <button type="button" className="btn sm" onClick={() => onDelete(s.id)}>Delete</button>
            <button type="button" className="btn ghost sm" onClick={() => setConfirming(false)}>Keep</button>
          </>
        ) : (
          <button type="button" className="btn ghost sm" aria-label="Delete subject" onClick={() => setConfirming(true)}>
            <Icon name="trash" />
          </button>
        )}
      </div>
      <div className="form-grid">
        <Field id={`sb-n-${index}`} label="Name">
          <input id={`sb-n-${index}`} type="text" value={s.name} onChange={(e) => change({ name: e.target.value })} />
        </Field>
        <Field id={`sb-c-${index}`} label="Colour">
          <input id={`sb-c-${index}`} type="color" value={s.color.toLowerCase()} onChange={(e) => change({ color: e.target.value })} />
        </Field>
      </div>
      <span className="label muted">Icon</span>
      <div className="icon-pick">
        {SUBJECT_ICONS.map((n) => (
          <button key={n} type="button" aria-pressed={s.icon === n} aria-label={n} onClick={() => change({ icon: n }, true)}>
            <Icon name={n} />
          </button>
        ))}
      </div>
      <span className="label muted">Offered at</span>
      <div className="row">
        {levels.map((l) => (
          <label className="choice" key={l.id}>
            <input
              type="checkbox"
              checked={s.levels.includes(l.id)}
              onChange={(e) => change({ levels: e.target.checked ? [...s.levels, l.id] : s.levels.filter((x) => x !== l.id) }, true)}
            />
            {l.name}
          </label>
        ))}
      </div>
    </section>
  );
}
