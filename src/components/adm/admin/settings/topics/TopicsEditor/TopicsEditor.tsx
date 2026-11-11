"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { plural } from "@/lib/format";
import { topicIcon } from "@/lib/icons";
import type { Pathway, Strand, Subject, TopicsData } from "@/types/admin";

// New strands and topics have no id until the server saves them: they carry a temporary negative one.
let temp = 0;
const tempId = () => --temp;

/** The strands and topics of one pathway (a subject at a level). The learning map is built from this. Changes save as you go. */
export default function TopicsEditor({ pathways, current, initial, subjects }: { pathways: Pathway[]; current: Pathway; initial: TopicsData; subjects: Subject[] }) {
  const router = useRouter();
  const [strands, setStrands] = useState<Strand[]>(initial.strands);
  const [confirming, setConfirming] = useState<number | null>(null);
  const topicInputs = useRef<Record<number, HTMLUListElement | null>>({});
  const subject = subjects.find((s) => s.id === current.subjectId);

  const save = useAutosave(async (next: Strand[]) => {
    const saved = await send<TopicsData>("PUT", `/admin/settings/topics/${current.subjectId}/${current.levelId}`, {
      strands: next.map((s) => ({ id: s.id > 0 ? s.id : undefined, name: s.name, topics: s.topics.map((t) => ({ id: t.id > 0 ? t.id : undefined, name: t.name })) })),
    });
    // Keep what is being typed, and take the ids the server gave to new strands and topics.
    setStrands((now) => now.map((s, i) => ({ ...s, id: saved.strands[i]?.id ?? s.id, topics: s.topics.map((t, j) => ({ ...t, id: saved.strands[i]?.topics[j]?.id ?? t.id })) })));
  });

  function update(next: Strand[], now = false) {
    setStrands(next);
    save(next, now);
  }

  const topicCount = strands.reduce((a, s) => a + s.topics.length, 0);
  const nDiag = initial.diagnosticQuestions;

  return (
    <>
      <section className="card">
        <div className="row between">
          <Field id="tp-path" label="Pathway">
            <select id="tp-path" value={current.key} onChange={(e) => router.push(`/admin/settings/topics?path=${encodeURIComponent(e.target.value)}`)}>
              {pathways.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </Field>
          <div className="row">
            {subject && <SubjectBadge icon={subject.icon} color={subject.color} />}
            <span className="small muted">
              {plural(topicCount, "topic")} · {nDiag ? `${nDiag} diagnostic questions` : "diagnostic uses a confidence check"}
            </span>
          </div>
        </div>
        <p className="small muted">Strands are the big sections of the learning map. Topics sit inside them, and get their icon from their name.</p>
      </section>

      {strands.map((st, i) => (
        <section className="card" key={i}>
          <div className="row between">
            <div className="row grow">
              <span className="tic">
                <Icon name={topicIcon(st.name)} />
              </span>
              <input type="text" className="strand-name" value={st.name} aria-label="Strand name" onChange={(e) => update(strands.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
            </div>
            {confirming === i ? (
              <>
                <button type="button" className="btn sm" onClick={() => { setConfirming(null); update(strands.filter((_, k) => k !== i), true); }}>Delete strand</button>
                <button type="button" className="btn ghost sm" onClick={() => setConfirming(null)}>Keep</button>
              </>
            ) : (
              <button type="button" className="btn ghost sm" aria-label="Delete strand" onClick={() => setConfirming(i)}>
                <Icon name="trash" />
              </button>
            )}
          </div>
          <ul className="topic-edit" ref={(el) => { topicInputs.current[i] = el; }}>
            {st.topics.map((t, j) => (
              <li key={j}>
                <span className="tic sm">
                  <Icon name={topicIcon(st.name, t.name)} />
                </span>
                <input
                  type="text"
                  value={t.name}
                  aria-label="Topic name"
                  onChange={(e) => update(strands.map((x, k) => (k === i ? { ...x, topics: x.topics.map((y, m) => (m === j ? { ...y, name: e.target.value } : y)) } : x)))}
                />
                <button
                  type="button"
                  className="btn ghost sm"
                  disabled={j === 0}
                  aria-label="Move up"
                  onClick={() => update(strands.map((x, k) => (k === i ? { ...x, topics: x.topics.map((y, m) => (m === j - 1 ? x.topics[j] : m === j ? x.topics[j - 1] : y)) } : x)), true)}
                >
                  ↑
                </button>
                <button type="button" className="btn ghost sm" aria-label="Delete topic" onClick={() => update(strands.map((x, k) => (k === i ? { ...x, topics: x.topics.filter((_, m) => m !== j) } : x)), true)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              const id = tempId();
              update(strands.map((x, k) => (k === i ? { ...x, topics: [...x.topics, { id, name: "New topic" }] } : x)), true);
              // The new topic's name is ready to type over.
              setTimeout(() => {
                const inputs = topicInputs.current[i]?.querySelectorAll("input");
                const last = inputs?.[inputs.length - 1];
                last?.focus();
                last?.select();
              }, 0);
            }}
          >
            <Icon name="plus" />
            Add topic
          </button>
        </section>
      ))}

      <div className="row">
        <button type="button" className="btn primary sm" onClick={() => update([...strands, { id: tempId(), name: "New strand", topics: [{ id: tempId(), name: "New topic" }] }], true)}>
          <Icon name="plus" />
          Add strand
        </button>
      </div>
    </>
  );
}
