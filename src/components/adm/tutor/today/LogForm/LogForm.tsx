"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import { niceTime, shortDate } from "@/lib/format";
import type { LogFormData } from "@/types/tutor";

/** Log a finished session in about 30 seconds: topic covered, who was there, how it went, homework. */
export default function LogForm({ form }: { form: LogFormData }) {
  const router = useRouter();
  const toast = useToast();
  const [topicId, setTopicId] = useState(form.topics[0]?.id ?? 0);
  const [attendance, setAttendance] = useState<Record<number, boolean>>(Object.fromEntries(form.students.map((s) => [s.enrolmentId, true])));
  const [note, setNote] = useState("");
  const [homework, setHomework] = useState("");
  const b = form.session;

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await send("POST", "/tutor/today/logs", { bookingId: b.id, topicId: topicId || null, attendance: Object.fromEntries(Object.entries(attendance).map(([k, v]) => [k, v])), note, homework });
      toast("Session logged");
      router.push("/tutor");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    }
  }

  return (
    <section className="card hl-card">
      <div className="row between">
        <h2>
          <Icon name="edit" /> Log: {b.who}
        </h2>
        <span className="small muted">
          {shortDate(b.date)} · {niceTime(b.start)}
        </span>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="lg-topic" label="Topic covered">
          <select id="lg-topic" value={topicId} onChange={(e) => setTopicId(Number(e.target.value))}>
            {form.topics.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
        <fieldset className="field">
          <legend>Attendance</legend>
          <div className="row">
            {form.students.map((s) => (
              <label className="choice" key={s.enrolmentId}>
                <input type="checkbox" checked={attendance[s.enrolmentId] ?? false} onChange={(e) => setAttendance((a) => ({ ...a, [s.enrolmentId]: e.target.checked }))} />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="lg-note" label="How did it go?">
          <textarea id="lg-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Good progress on factorising; needs practice with negative coefficients." />
        </Field>
        <Field id="lg-hw" label="Homework set">
          <input id="lg-hw" type="text" value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="Optional" />
        </Field>
        <div className="row">
          <button type="submit" className="btn primary">Save log</button>
          <Link href="/tutor" className="btn ghost">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
