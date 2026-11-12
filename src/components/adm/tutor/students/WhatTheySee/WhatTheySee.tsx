"use client";

import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";

/** "What <name> sees": the group they are in, and the learning routes they can follow. */
export default function WhatTheySee({ firstName, groupId, groups, onGroup }: { firstName: string; groupId: number | null; groups: { id: number; name: string }[]; onGroup: (id: number | null) => void }) {
  return (
    <section className="card">
      <h2>
        <Icon name="eye" /> What {firstName} sees
      </h2>
      <Field id="pg-grp" label="Group">
        <select id="pg-grp" value={groupId ?? ""} onChange={(e) => onGroup(e.target.value ? Number(e.target.value) : null)}>
          <option value="">No group (1:1 or self-paced)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </Field>
      <span className="label muted">Learning routes</span>
      <p className="small muted">No routes for this pathway yet. Make one in Content.</p>
    </section>
  );
}
