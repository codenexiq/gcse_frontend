"use client";

import { useState } from "react";
import LevelCard from "@/components/adm/admin/settings/levels/LevelCard";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { LevelWithUse } from "@/types/admin";

/** All levels (Key Stage 3, GCSE, A-level...) and a way to add one. */
export default function LevelsPanel({ initial }: { initial: LevelWithUse[] }) {
  const toast = useToast();
  const [levels, setLevels] = useState(initial);
  const [name, setName] = useState("");

  async function add() {
    const n = name.trim();
    if (!n) return toast("Type a name first.");
    try {
      const made = await send<LevelWithUse>("POST", "/admin/settings/levels", { name: n });
      setLevels((l) => [...l, made]);
      setName("");
      toast(`${n} added. Now tick it on the subjects that offer it.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add the level.");
    }
  }

  async function remove(id: string) {
    try {
      await send("DELETE", `/admin/settings/levels/${id}`);
      setLevels((l) => l.filter((x) => x.id !== id));
      toast("Level deleted");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete the level.");
    }
  }

  return (
    <div className="stack">
      {levels.map((l, i) => (
        <LevelCard key={l.id} level={l} index={i} onDelete={(id) => void remove(id)} />
      ))}
      <section className="card">
        <h3>
          <Icon name="plus" /> Add a level
        </h3>
        <div className="row add-step">
          <Field id="lv-new" label="Name">
            <input id="lv-new" type="text" value={name} placeholder="e.g. Key Stage 2 or 11+" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          </Field>
          <button type="button" className="btn primary sm" onClick={() => void add()}>Add level</button>
        </div>
      </section>
    </div>
  );
}
