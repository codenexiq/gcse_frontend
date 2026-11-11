"use client";

import { useState } from "react";
import SubjectCard from "@/components/adm/admin/settings/subjects/SubjectCard";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { Level, SubjectWithUse } from "@/types/admin";

/** All subjects and a way to add one. */
export default function SubjectsPanel({ initial, levels }: { initial: SubjectWithUse[]; levels: Level[] }) {
  const toast = useToast();
  const [subjects, setSubjects] = useState(initial);
  const [name, setName] = useState("");

  async function add() {
    const n = name.trim();
    if (!n) return toast("Type a name first.");
    try {
      const made = await send<SubjectWithUse>("POST", "/admin/settings/subjects", { name: n });
      setSubjects((s) => [...s, made]);
      setName("");
      toast(`${n} added at GCSE. Tick other levels, then add topics.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add the subject.");
    }
  }

  async function remove(id: string) {
    try {
      await send("DELETE", `/admin/settings/subjects/${id}`);
      setSubjects((s) => s.filter((x) => x.id !== id));
      toast("Subject deleted");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete the subject.");
    }
  }

  return (
    <div className="grid2">
      {subjects.map((s, i) => (
        <SubjectCard key={s.id} subject={s} index={i} levels={levels} onDelete={(id) => void remove(id)} />
      ))}
      <section className="card">
        <h3>
          <Icon name="plus" /> Add a subject
        </h3>
        <div className="row add-step">
          <Field id="sb-new" label="Name">
            <input id="sb-new" type="text" value={name} placeholder="e.g. Computer Science" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          </Field>
          <button type="button" className="btn primary sm" onClick={() => void add()}>Add subject</button>
        </div>
      </section>
    </div>
  );
}
