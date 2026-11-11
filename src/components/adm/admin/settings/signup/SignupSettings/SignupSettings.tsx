"use client";

import { useState } from "react";
import Link from "next/link";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";

/** The headline on the welcome screen, and a way to try the sign-up as a new student. */
export default function SignupSettings({ initialWelcome }: { initialWelcome: string }) {
  const [welcome, setWelcome] = useState(initialWelcome);
  const save = useAutosave((value: string) => (value.trim() ? send("PUT", "/admin/settings/signup", { welcome: value }) : Promise.resolve()));

  return (
    <section className="card stack">
      <Field id="su-wel" label="Headline on the welcome screen">
        <input id="su-wel" type="text" value={welcome} onChange={(e) => { setWelcome(e.target.value); save(e.target.value); }} />
      </Field>
      <p className="small muted">
        Sign-up order: 1. Level → 2. Plan → 3. Subjects (each with its own tier, grade and target) → 4. Student and parent details. Levels, subjects and plans come from the other settings tabs.
      </p>
      <div className="row">
        <Link href="/student?preview=signup" className="btn primary">
          <Icon name="eye" />
          Preview sign-up as a new student
        </Link>
      </div>
    </section>
  );
}
