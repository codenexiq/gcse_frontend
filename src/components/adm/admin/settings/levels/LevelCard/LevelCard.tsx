"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import type { LevelWithUse } from "@/types/admin";

type Edit = Omit<LevelWithUse, "id" | "inUse">;

/** A comma-separated list in one box; it is split into items when you leave the box. */
function ListField({ id, label, hint, items, onCommit }: { id: string; label: string; hint?: string; items: string[]; onCommit: (items: string[]) => void }) {
  const [text, setText] = useState(items.join(", "));
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const next = text.split(",").map((x) => x.trim()).filter(Boolean);
          setText(next.join(", "));
          onCommit(next);
        }}
      />
    </Field>
  );
}

/** One level: its names, year groups, tiers, exam boards and grades. A level that is in use cannot be deleted. */
export default function LevelCard({ level, index, onDelete }: { level: LevelWithUse; index: number; onDelete: (id: string) => void }) {
  const [l, setL] = useState(level);
  const [confirming, setConfirming] = useState(false);
  const save = useAutosave((edit: Edit) => send("PUT", `/admin/settings/levels/${l.id}`, edit));

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...l, ...patch };
    setL(next);
    save({ name: next.name, short: next.short, years: next.years, tiers: next.tiers, boards: next.boards, grades: next.grades }, now);
  }

  return (
    <section className="card">
      <div className="row between">
        <h3>{l.name}</h3>
        {l.inUse ? (
          <span className="small muted">In use</span>
        ) : confirming ? (
          <>
            <button type="button" className="btn sm" onClick={() => onDelete(l.id)}>Delete level</button>
            <button type="button" className="btn ghost sm" onClick={() => setConfirming(false)}>Keep</button>
          </>
        ) : (
          <button type="button" className="btn ghost sm" onClick={() => setConfirming(true)}>
            <Icon name="trash" />
            Delete
          </button>
        )}
      </div>
      <div className="form-grid">
        <Field id={`lv-n-${index}`} label="Name">
          <input id={`lv-n-${index}`} type="text" value={l.name} onChange={(e) => change({ name: e.target.value })} />
        </Field>
        <Field id={`lv-s-${index}`} label="Short name">
          <input id={`lv-s-${index}`} type="text" value={l.short} onChange={(e) => change({ short: e.target.value })} />
        </Field>
        <ListField id={`lv-y-${index}`} label="Year groups" hint="comma separated" items={l.years} onCommit={(years) => change({ years }, true)} />
        <ListField id={`lv-t-${index}`} label="Tiers" hint="leave empty if none" items={l.tiers} onCommit={(tiers) => change({ tiers }, true)} />
        <ListField id={`lv-b-${index}`} label="Exam boards" items={l.boards} onCommit={(boards) => change({ boards }, true)} />
        <ListField id={`lv-g-${index}`} label="Grades (lowest first)" items={l.grades} onCommit={(grades) => change({ grades }, true)} />
      </div>
    </section>
  );
}
