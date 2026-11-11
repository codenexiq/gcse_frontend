"use client";

import { useEffect, useRef } from "react";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { niceDate } from "@/lib/format";
import type { Level, StudentDetail } from "@/types/admin";

interface Props {
  student: StudentDetail;
  levels: Level[];
  plans: { id: string; name: string }[];
  /** A student who has just been added starts with their name selected, ready to type over. */
  focusName: boolean;
  onChange: (patch: Partial<Pick<StudentDetail, "name" | "email" | "level" | "year" | "plan">>, now?: boolean) => void;
  onPasswordReset: () => void;
}

/** The student's name, login email, level, year and plan. */
export default function StudentDetailsCard({ student: s, levels, plans, focusName, onChange, onPasswordReset }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const level = levels.find((l) => l.id === s.level);
  const years = level && level.years.length ? level.years : [s.year];

  useEffect(() => {
    if (focusName) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [focusName]);

  return (
    <section className="card">
      <h2>
        <Icon name="users" /> Student
      </h2>
      <div className="form-grid">
        <Field id="as-name" label="Full name">
          <input id="as-name" ref={nameRef} type="text" value={s.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field id="as-email" label="Email (login)">
          <input id="as-email" type="email" value={s.email} onChange={(e) => onChange({ email: e.target.value })} />
        </Field>
        <Field id="as-level" label="Level">
          <select id="as-level" value={s.level} onChange={(e) => onChange({ level: e.target.value }, true)}>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
        <Field id="as-year" label="Year">
          <select id="as-year" value={s.year} onChange={(e) => onChange({ year: e.target.value }, true)}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field id="as-plan" label="Plan">
          <select id="as-plan" value={s.plan} onChange={(e) => onChange({ plan: e.target.value }, true)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="login-box">
        <Icon name="lock" />
        <div className="stack grow">
          <strong>Login</strong>
          <span className="small muted">
            Signs in with {s.email || "no email yet"}. Joined {niceDate(s.joined)}.
          </span>
        </div>
        <button type="button" className="btn sm" onClick={onPasswordReset}>Send password reset</button>
      </div>
    </section>
  );
}
