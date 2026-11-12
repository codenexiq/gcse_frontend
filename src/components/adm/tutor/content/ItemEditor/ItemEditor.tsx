"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BlockEditor from "@/components/adm/tutor/content/BlockEditor";
import Chip from "@/components/adm/ui/Chip";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { BLOCK_LABEL, contentHref, KIND, newBlock } from "@/lib/content";
import { plural } from "@/lib/format";
import type { BlockData, ContentItem, ItemKind } from "@/types/tutor";

type Keyed = BlockData & { key: number };
type State = Omit<ContentItem, "blocks"> & { blocks: Keyed[] };

const KINDS: ItemKind[] = ["lesson", "notes", "quiz", "video"];
const ADD: BlockData["type"][] = ["slide", "mcq", "written", "video"];

/** Edits one item: its title, type, topic, visibility, and the parts (slides, videos, questions) in order. Changes save as you type. */
export default function ItemEditor({ initial }: { initial: ContentItem }) {
  const router = useRouter();
  const toast = useToast();
  const counter = useRef(initial.blocks.length);
  const [item, setItem] = useState<State>(() => ({ ...initial, blocks: initial.blocks.map((b, i) => ({ ...b, key: i })) }));
  const [confirm, setConfirm] = useState(false);
  const path = `${item.subject}|${item.level}`;

  const save = useAutosave((s: State) =>
    send("PUT", `/tutor/content/items/${s.id}`, {
      title: s.title,
      kind: s.kind,
      topicId: s.topicId,
      published: s.published,
      blocks: s.blocks.map((b) => {
        const { key, ...rest } = b;
        void key;
        return rest;
      }),
    })
  );

  function update(next: State, now = false) {
    setItem(next);
    if (next.title.trim()) save(next, now); // a blank title is not saved until something is typed
  }
  const setBlock = (key: number, patch: Partial<BlockData>) => update({ ...item, blocks: item.blocks.map((b) => (b.key === key ? ({ ...b, ...patch } as Keyed) : b)) });
  function move(i: number, d: -1 | 1) {
    const blocks = [...item.blocks];
    [blocks[i], blocks[i + d]] = [blocks[i + d], blocks[i]];
    update({ ...item, blocks }, true);
  }
  const remove = (key: number) => update({ ...item, blocks: item.blocks.filter((b) => b.key !== key) }, true);
  const add = (type: BlockData["type"]) => update({ ...item, blocks: [...item.blocks, { ...newBlock(type), key: counter.current++ } as Keyed] }, true);

  async function del() {
    try {
      await send("DELETE", `/tutor/content/items/${item.id}`);
      toast("Deleted");
      router.push(contentHref({ path }));
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be deleted.");
    }
  }

  const questions = item.blocks.filter((b) => b.type === "mcq" || b.type === "written").length;

  return (
    <div className="stack">
      <div className="row between">
        <Link href={contentHref({ path })} className="btn ghost sm">
          ‹ Library
        </Link>
        {confirm ? (
          <div className="row">
            <span className="small">Delete for good?</span>
            <button type="button" className="btn sm" onClick={del}>
              Delete
            </button>
            <button type="button" className="btn ghost sm" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </div>
        ) : (
          <button type="button" className="btn ghost sm" onClick={() => setConfirm(true)}>
            <Icon name="trash" />
            Delete
          </button>
        )}
      </div>

      <div className="card">
        <div className="form-grid">
          <Field id="it-title" label="Title">
            <input id="it-title" type="text" value={item.title} maxLength={160} onChange={(e) => update({ ...item, title: e.target.value })} />
          </Field>
          <Field id="it-kind" label="Type">
            <select id="it-kind" value={item.kind} onChange={(e) => update({ ...item, kind: e.target.value as ItemKind }, true)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND[k].label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="it-topic" label="Topic">
            <select id="it-topic" value={item.topicId ?? ""} onChange={(e) => update({ ...item, topicId: e.target.value ? Number(e.target.value) : null }, true)}>
              <option value="">No topic</option>
              {item.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="row between">
          <div className="row">
            <Chip tone="c-cream">{plural(item.blocks.length - questions, "slide")}</Chip>
            <Chip tone="c-blue">{plural(questions, "question")}</Chip>
            {item.source && <Chip tone="c-out">From {item.source}</Chip>}
          </div>
          <label className="switch">
            <input type="checkbox" checked={item.published} onChange={(e) => update({ ...item, published: e.target.checked }, true)} />
            <span>Visible to students</span>
          </label>
        </div>
      </div>

      {item.kind === "quiz" && !item.published && (
        <div className="tip warn">
          <Icon name="eye" />
          <span>
            <strong>Check before you publish.</strong> Read each question and answer, fix anything, then switch on Visible to students.
          </span>
        </div>
      )}

      {item.blocks.map((b, i) => (
        <BlockEditor key={b.key} block={b} index={i} count={item.blocks.length} onChange={(patch) => setBlock(b.key, patch)} onMove={(d) => move(i, d)} onRemove={() => remove(b.key)} />
      ))}

      <div className="card">
        <strong>Add</strong>
        <div className="row">
          {ADD.map((t) => (
            <button key={t} type="button" className="btn sm" onClick={() => add(t)}>
              + {BLOCK_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
