"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";

const tomorrow = () => {
  const d = new Date(Date.now() + 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Book a group class or a one-to-one. The student gets a message with the time. */
export default function BookSession({ options }: { options: { value: string; label: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [who, setWho] = useState(options[0]?.value ?? "");
  const [date, setDate] = useState(tomorrow());
  const [start, setStart] = useState("17:00");
  const [mins, setMins] = useState("60");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!who || !date || !start) return toast("Choose who, a date and a start time.");
    try {
      const res = await send<{ label: string }>("POST", "/tutor/today/bookings", { who, date, start, mins: Number(mins) || 60 });
      toast(res.label);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be booked.");
    }
  }

  return (
    <section className="card">
      <h2>
        <Icon name="plus" /> Book a session
      </h2>
      <form className="form-grid" onSubmit={submit} noValidate>
        <Field id="bk-who" label="Who">
          <select id="bk-who" value={who} onChange={(e) => setWho(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field id="bk-date" label="Date">
          <input id="bk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field id="bk-start" label="Start">
          <input id="bk-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field id="bk-mins" label="Length">
          <select id="bk-mins" value={mins} onChange={(e) => setMins(e.target.value)}>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
            <option value="90">1½ hours</option>
          </select>
        </Field>
        <div className="row">
          <button type="submit" className="btn primary">Book</button>
          <span className="small muted">The student gets a message with the time.</span>
        </div>
      </form>
    </section>
  );
}
