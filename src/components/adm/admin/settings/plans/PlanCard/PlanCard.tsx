"use client";

import { useState } from "react";
import Field from "@/components/adm/ui/Field";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import type { Level, Plan } from "@/types/admin";

type Edit = Omit<Plan, "id">;

const editOf = (p: Plan): Edit => ({ name: p.name, tagline: p.tagline, live: p.live, mocks: p.mocks, popular: p.popular, features: p.features, prices: p.prices });

/** One plan: name, tagline, a price for each level, live classes a week, mock exams, the "Most popular" ribbon and what is included. */
export default function PlanCard({ plan, index, levels }: { plan: Plan; index: number; levels: Level[] }) {
  const [p, setP] = useState(plan);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const save = useAutosave((edit: Edit) => send("PUT", `/admin/settings/plans/${p.id}`, edit));

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...p, ...patch };
    setP(next);
    save(editOf(next), now);
  }

  return (
    <section className="card">
      <Field id={`pl-n-${index}`} label="Plan name">
        <input id={`pl-n-${index}`} type="text" value={p.name} onChange={(e) => change({ name: e.target.value })} />
      </Field>
      <Field id={`pl-t-${index}`} label="Tagline">
        <input id={`pl-t-${index}`} type="text" value={p.tagline} onChange={(e) => change({ tagline: e.target.value })} />
      </Field>
      {levels.map((l) => (
        <Field key={l.id} id={`pl-p-${index}-${l.id}`} label={`Price for ${l.short}`}>
          <input
            id={`pl-p-${index}-${l.id}`}
            type="text"
            value={p.prices[l.id] ?? ""}
            placeholder="e.g. £49/month"
            onChange={(e) => change({ prices: { ...p.prices, [l.id]: e.target.value } })}
          />
        </Field>
      ))}
      <Field id={`pl-l-${index}`} label="Live classes per week">
        <select id={`pl-l-${index}`} value={p.live} onChange={(e) => change({ live: Number(e.target.value) }, true)}>
          <option value={0}>None (self-paced)</option>
          <option value={1}>1 a week</option>
          <option value={2}>2 a week</option>
          <option value={3}>3 a week</option>
        </select>
      </Field>
      <label className="choice">
        <input type="checkbox" checked={p.mocks} onChange={(e) => change({ mocks: e.target.checked }, true)} /> Includes mock exams
      </label>
      <label className="choice">
        <input type="checkbox" checked={p.popular} onChange={(e) => change({ popular: e.target.checked }, true)} /> Show “Most popular” ribbon
      </label>
      <Field id={`pl-f-${index}`} label="What's included" hint="one per line">
        <textarea
          id={`pl-f-${index}`}
          rows={4}
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          onBlur={() => change({ features: features.split("\n").map((x) => x.trim()).filter(Boolean) }, true)}
        />
      </Field>
    </section>
  );
}
