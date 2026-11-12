"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Empty from "@/components/adm/ui/Empty";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { contentHref, KIND } from "@/lib/content";
import { plural } from "@/lib/format";
import type { ContentPath, RouteDetail, RoutesData } from "@/types/tutor";

const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Learning routes for one pathway: the order students work through items, a week for each, and who sees the route. */
export default function RoutesPanel({ path, data, current }: { path: ContentPath; data: RoutesData; current: RouteDetail | null }) {
  const router = useRouter();
  const toast = useToast();
  const [route, setRoute] = useState(current);
  const [toAdd, setToAdd] = useState("");
  const [confirm, setConfirm] = useState(false);
  const save = useAutosave((r: RouteDetail) => send("PUT", `/tutor/content/routes/${r.id}`, { name: r.name, steps: r.steps, groups: r.groups, enrolments: r.enrolments }).then(() => router.refresh()));
  const itemOf = (id: number) => data.items.find((i) => i.id === id);

  function update(next: RouteDetail, now = false) {
    setRoute(next);
    if (next.name.trim()) save(next, now);
  }
  async function act(fn: () => Promise<RouteDetail | null>, msg?: string) {
    try {
      const r = await fn();
      if (msg) toast(msg);
      router.push(contentHref({ path: path.key, view: "routes", route: r?.id }));
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be done.");
    }
  }
  const create = () => act(() => send<RouteDetail>("POST", "/tutor/content/routes", { subject: path.subject.id, level: path.level.id }));

  const left = (
    <div className="stack">
      {data.routes.map((r) => (
        <Link key={r.id} href={contentHref({ path: path.key, view: "routes", route: r.id })} className="list-btn" aria-current={route?.id === r.id}>
          <strong>{r.name}</strong>
          <span className="small muted">
            {plural(r.steps, "step")} · shown to {r.shownTo.length ? r.shownTo.join(", ") : "nobody yet"}
          </span>
        </Link>
      ))}
      <button type="button" className="btn sm" onClick={create}>
        <Icon name="plus" />
        New route
      </button>
      <p className="small muted">A route is the order students work through lessons, notes and quizzes. Reuse it for any group or student.</p>
    </div>
  );

  if (!route) {
    return (
      <div className="two-col">
        {left}
        <Empty title="No routes yet" text="Create one, then add steps from the library." />
      </div>
    );
  }

  const move = (i: number, d: -1 | 1) => {
    const steps = [...route.steps];
    [steps[i], steps[i + d]] = [steps[i + d], steps[i]];
    update({ ...route, steps }, true);
  };
  const toggle = (key: "groups" | "enrolments", id: number, on: boolean) => update({ ...route, [key]: on ? [...route[key], id] : route[key].filter((x) => x !== id) }, true);

  return (
    <div className="two-col">
      {left}
      <div className="stack">
        <div className="card">
          <Field id="r-name" label="Route name">
            <input id="r-name" type="text" value={route.name} maxLength={160} onChange={(e) => update({ ...route, name: e.target.value })} />
          </Field>
          <div className="row">
            <button type="button" className="btn sm" onClick={() => act(() => send<RouteDetail>("POST", `/tutor/content/routes/${route.id}/duplicate`), "Duplicated. Choose who sees the copy.")}>
              Duplicate
            </button>
            {confirm ? (
              <>
                <span className="small">Delete this route?</span>
                <button type="button" className="btn sm" onClick={() => act(() => send("DELETE", `/tutor/content/routes/${route.id}`).then(() => null), "Route deleted")}>
                  Delete
                </button>
                <button type="button" className="btn ghost sm" onClick={() => setConfirm(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button type="button" className="btn ghost sm" onClick={() => setConfirm(true)}>
                Delete route
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            <Icon name="route" /> Steps
          </h3>
          {route.steps.length === 0 ? (
            <p className="muted small">No steps yet.</p>
          ) : (
            <ol className="steps">
              {route.steps.map((st, i) => {
                const it = itemOf(st.itemId);
                if (!it) return null;
                return (
                  <li className="step" key={`${st.itemId}-${i}`}>
                    <span className="step-n">{i + 1}</span>
                    <span className={`kind k-${it.kind}`}>
                      <Icon name={KIND[it.kind].icon} />
                    </span>
                    <div className="stack grow">
                      <strong>{it.title}</strong>
                      <span className="small muted">
                        {KIND[it.kind].label}
                        {it.topic ? ` · ${it.topic}` : ""}
                        {it.published ? "" : " · draft, hidden until visible"}
                      </span>
                    </div>
                    <select aria-label="Week" value={st.week} onChange={(e) => update({ ...route, steps: route.steps.map((s, j) => (j === i ? { ...s, week: Number(e.target.value) } : s)) }, true)}>
                      {WEEKS.map((w) => (
                        <option key={w} value={w}>
                          Week {w}
                        </option>
                      ))}
                    </select>
                    <div className="row tight">
                      <button type="button" className="btn ghost sm" disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}>
                        ↑
                      </button>
                      <button type="button" className="btn ghost sm" disabled={i === route.steps.length - 1} aria-label="Move down" onClick={() => move(i, 1)}>
                        ↓
                      </button>
                      <button type="button" className="btn ghost sm" aria-label="Remove" onClick={() => update({ ...route, steps: route.steps.filter((_, j) => j !== i) }, true)}>
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <div className="row add-step">
            <Field id="r-add" label="Add from the library">
              <select id="r-add" value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
                <option value="">Choose…</option>
                {data.items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {KIND[i.kind].label}: {i.title}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              className="btn primary sm"
              disabled={!toAdd}
              onClick={() => {
                update({ ...route, steps: [...route.steps, { itemId: Number(toAdd), week: route.steps.length ? route.steps[route.steps.length - 1].week : 1 }] }, true);
                setToAdd("");
              }}
            >
              Add step
            </button>
          </div>
        </div>

        <div className="card">
          <h3>
            <Icon name="eye" /> Show on these screens
          </h3>
          <p className="small muted">Students see the visible steps as tasks with due dates, on their learning map. They get a message when a route is first shown to them.</p>
          {data.groups.length > 0 && (
            <>
              <span className="label muted">Groups</span>
              <div className="row">
                {data.groups.map((g) => (
                  <label className="choice" key={g.id}>
                    <input type="checkbox" checked={route.groups.includes(g.id)} onChange={(e) => toggle("groups", g.id, e.target.checked)} />
                    {g.name}
                  </label>
                ))}
              </div>
            </>
          )}
          {data.students.length > 0 && (
            <>
              <span className="label muted">Individual students</span>
              <div className="row">
                {data.students.map((s) => (
                  <label className="choice" key={s.enrolmentId}>
                    <input type="checkbox" checked={route.enrolments.includes(s.enrolmentId)} onChange={(e) => toggle("enrolments", s.enrolmentId, e.target.checked)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
