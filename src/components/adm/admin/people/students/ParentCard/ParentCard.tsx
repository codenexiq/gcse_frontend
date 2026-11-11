"use client";

import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import type { Parent } from "@/types/admin";

/** The parent or carer's contact details. Only admins see these. */
export default function ParentCard({ parent, onChange }: { parent: Parent; onChange: (patch: Partial<Parent>) => void }) {
  return (
    <section className="card">
      <h2>
        <Icon name="shield" /> Parent or carer
      </h2>
      <div className="form-grid">
        <Field id="ap-name" label="Name">
          <input id="ap-name" type="text" value={parent.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field id="ap-email" label="Email">
          <input id="ap-email" type="email" value={parent.email} onChange={(e) => onChange({ email: e.target.value })} />
        </Field>
        <Field id="ap-phone" label="Phone">
          <input id="ap-phone" type="tel" value={parent.phone} onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
      </div>
      <p className="small muted">
        <Icon name="lock" /> Only admins see this. Tutors see academic details only.
      </p>
    </section>
  );
}
