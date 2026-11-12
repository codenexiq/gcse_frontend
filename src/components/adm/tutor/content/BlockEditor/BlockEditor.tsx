"use client";

import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import { BLOCK_LABEL, blockKind, KIND } from "@/lib/content";
import type { BlockData } from "@/types/tutor";

interface Props {
  block: BlockData;
  index: number;
  count: number;
  onChange: (patch: Partial<BlockData>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

const LETTERS = "ABCDEF";

/** Plain paragraphs for the preview under a slide (blank lines start a new paragraph). */
const paragraphs = (t: string) => t.split(/\n\s*\n/).filter((p) => p.trim());

/** One part of an item: a slide, a video, a multiple-choice question or a written question. */
export default function BlockEditor({ block: b, index: i, count, onChange, onMove, onRemove }: Props) {
  const id = `b${i}`;
  const text = (field: string, label: string, value: string, rows?: number, hint?: string) => (
    <Field id={`${id}-${field}`} label={label} hint={hint}>
      {rows ? (
        <textarea id={`${id}-${field}`} rows={rows} value={value} onChange={(e) => onChange({ [field]: e.target.value } as Partial<BlockData>)} />
      ) : (
        <input id={`${id}-${field}`} type="text" value={value} onChange={(e) => onChange({ [field]: e.target.value } as Partial<BlockData>)} />
      )}
    </Field>
  );
  const kind = blockKind(b.type);

  return (
    <section className="card blk">
      <div className="row between">
        <div className="row">
          <span className={`kind k-${kind}`}>
            <Icon name={KIND[kind].icon} />
          </span>
          <strong>
            {i + 1}. {BLOCK_LABEL[b.type]}
          </strong>
        </div>
        <div className="row tight">
          <button type="button" className="btn ghost sm" disabled={i === 0} aria-label="Move up" onClick={() => onMove(-1)}>
            ↑
          </button>
          <button type="button" className="btn ghost sm" disabled={i === count - 1} aria-label="Move down" onClick={() => onMove(1)}>
            ↓
          </button>
          <button type="button" className="btn ghost sm" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      {b.type === "slide" && (
        <>
          {text("title", "Heading", b.title)}
          {text("body", "Content", b.body, 6, "Blank line = new paragraph")}
          <div className="tex-preview">{paragraphs(b.body).map((p, k) => <p key={k}>{p}</p>)}{!b.body.trim() && <span className="small muted">Nothing yet</span>}</div>
        </>
      )}

      {b.type === "video" && (
        <>
          {text("title", "Title", b.title)}
          {text("url", "Video link", b.url)}
          {text("note", "Note for students", b.note, 3)}
        </>
      )}

      {b.type === "mcq" && (
        <>
          {text("question", "Question", b.question, 3)}
          <fieldset className="opts-edit">
            <legend>
              Options <span className="hint">Tick the correct one</span>
            </legend>
            {b.options.map((o, k) => (
              <div className="opt-row" key={k}>
                <input type="radio" name={`${id}-correct`} checked={b.correct === k} aria-label={`Option ${LETTERS[k]} is correct`} onChange={() => onChange({ correct: k })} />
                <span className="letter">{LETTERS[k]}</span>
                <input type="text" value={o} aria-label={`Option ${LETTERS[k]}`} onChange={(e) => onChange({ options: b.options.map((x, j) => (j === k ? e.target.value : x)) })} />
              </div>
            ))}
          </fieldset>
          {text("explain", "Why that answer is right", b.explain, 3)}
        </>
      )}

      {b.type === "written" && (
        <>
          {text("question", "Question", b.question, 3)}
          {text("markScheme", "Mark scheme", b.markScheme, 3, "What earns each mark")}
          <Field id={`${id}-marks`} label="Marks">
            <input id={`${id}-marks`} type="number" min={1} max={6} style={{ maxWidth: 100 }} value={b.marks} onChange={(e) => onChange({ marks: Math.max(1, Math.min(6, Math.round(Number(e.target.value)) || 1)) })} />
          </Field>
        </>
      )}
    </section>
  );
}
