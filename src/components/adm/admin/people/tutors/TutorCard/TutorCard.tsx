"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import { useAutosave } from "@/hooks/useAutosave";
import { plural } from "@/lib/format";
import { send } from "@/lib/api";
import type { Subject, Tutor } from "@/types/admin";

type Edit = Pick<Tutor, "name" | "email" | "phone" | "subjects">;

/** One tutor: name, contact details and the subjects they teach. Changes save as you go. */
export default function TutorCard({ tutor, index, subjects }: { tutor: Tutor; index: number; subjects: Subject[] }) {
  const [t, setT] = useState(tutor);
  const save = useAutosave((edit: Edit) => send("PUT", `/admin/people/tutors/${t.id}`, edit));

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...t, ...patch };
    setT(next);
    save({ name: next.name, email: next.email, phone: next.phone, subjects: next.subjects }, now);
  }

  return (
    <section className="card">
      <div className="form-grid">
        <Field id={`tu-n-${index}`} label="Name">
          <input id={`tu-n-${index}`} type="text" value={t.name} onChange={(e) => change({ name: e.target.value })} />
        </Field>
        <Field id={`tu-e-${index}`} label="Email">
          <input id={`tu-e-${index}`} type="email" value={t.email} onChange={(e) => change({ email: e.target.value })} />
        </Field>
        <Field id={`tu-p-${index}`} label="Phone">
          <input id={`tu-p-${index}`} type="tel" value={t.phone} onChange={(e) => change({ phone: e.target.value })} />
        </Field>
      </div>
      <span className="label muted">Teaches</span>
      <div className="row">
        {subjects.map((s) => (
          <label className="choice" key={s.id}>
            <input
              type="checkbox"
              checked={t.subjects.includes(s.id)}
              onChange={(e) => change({ subjects: e.target.checked ? [...t.subjects, s.id] : t.subjects.filter((x) => x !== s.id) }, true)}
            />
            {s.name}
          </label>
        ))}
      </div>
      <p className="small muted">
        {plural(t.students, "student")} · {plural(t.groups, "group")}
      </p>
    </section>
  );
}
