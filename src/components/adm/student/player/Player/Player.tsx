"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { useTypeset } from "@/hooks/useTypeset";
import { send } from "@/lib/api";
import { plural } from "@/lib/format";
import { KEYS, toTeX } from "@/lib/maths";
import type { FinishResult, PlayerBlock, PlayerItem } from "@/types/student";

const LETTERS = "ABCDEF";
const paragraphs = (t: string) => t.split(/\n\s*\n/).filter((p) => p.trim());

interface Props {
  item: PlayerItem;
  /** Set for a practice set: it is saved against the topic, and "Try again" makes a fresh set. */
  practice?: { topicId: number; onAgain: () => void };
}

/**
 * Works through an item one part at a time: slides to read, videos to open, multiple-choice questions (the answer is
 * shown straight away) and written questions (the student writes with the maths keyboard, compares with the mark scheme
 * and gives themselves marks). At the end the score is saved: 70% or more marks the topic as mastered.
 */
export default function Player({ item, practice }: Props) {
  const toast = useToast();
  const box = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [mcq, setMcq] = useState<Record<number, number>>({});
  const [text, setText] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [marks, setMarks] = useState<Record<number, number>>({});
  const [result, setResult] = useState<FinishResult | null>(null);
  const [busy, setBusy] = useState(false);
  const back = `/student?enrolment=${item.enrolmentId}`;
  const n = item.blocks.length;
  useTypeset(box, [idx, mcq[idx], revealed[idx], text[idx], result, item.blocks]);

  if (n === 0) {
    return (
      <div className="player">
        <div className="slide-card center">
          <h1>{item.title}</h1>
          <p className="muted">There is nothing in this yet.</p>
          <Link href={back} className="btn primary">
            Back to my map
          </Link>
        </div>
      </div>
    );
  }

  async function finish() {
    setBusy(true);
    try {
      if (practice) {
        let got = 0;
        let max = 0;
        item.blocks.forEach((b, i) => {
          if (b.type === "mcq") {
            max += 1;
            if (mcq[i] === b.correct) got += 1;
          } else if (b.type === "written") {
            max += b.marks;
            got += Math.min(b.marks, marks[i] ?? 0);
          }
        });
        setResult(await send<FinishResult>("POST", `/student/topics/${practice.topicId}/practice-result`, { enrolmentId: item.enrolmentId, got, max: Math.max(1, max) }));
      } else {
        setResult(await send<FinishResult>("POST", `/student/items/${item.id}/finish`, { enrolmentId: item.enrolmentId, mcq, written: marks }));
      }
      window.scrollTo(0, 0);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function again() {
    if (practice) return practice.onAgain();
    setResult(null);
    setIdx(0);
    setMcq({});
    setText({});
    setRevealed({});
    setMarks({});
  }

  if (result) {
    const topicId = practice?.topicId ?? item.topicId;
    return (
      <div className="player" ref={box}>
        <div className="slide-card center">
          <Icon name={result.mastered || !result.max ? "check" : "target"} className="ico-xl" />
          <h1>{item.title}</h1>
          {result.max ? (
            <>
              <div className="big">{result.pct}%</div>
              <p className="muted">
                {result.got} of {result.max} marks
              </p>
              {result.mastered ? (
                <div className="fb good">
                  <strong>Mastered it.</strong> Over 70%, so this topic is marked as mastered.
                </div>
              ) : (
                <div className="fb bad">
                  <strong>Still needs work.</strong> Under 70%. Try a practice set with new questions on the same topic.
                </div>
              )}
            </>
          ) : (
            <p className="muted">This has been marked as complete.</p>
          )}
          <div className="row center">
            {!result.mastered && result.max > 0 && (practice ? (
              <button type="button" className="btn primary" onClick={again}>
                Practice set (new questions)
              </button>
            ) : topicId ? (
              <Link href={`/student/practice/${topicId}?enrolment=${item.enrolmentId}`} className="btn primary">
                Practice set (new questions)
              </Link>
            ) : (
              <button type="button" className="btn" onClick={again}>
                Try again
              </button>
            ))}
            <Link href={back} className={`btn${result.mastered || !result.max ? " primary" : ""}`}>
              Back to my map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const b: PlayerBlock = item.blocks[idx];
  const canGo = b.type === "mcq" ? mcq[idx] != null : b.type === "written" ? marks[idx] != null : true;

  function typeKey(v: string) {
    const el = document.getElementById(`w${idx}`) as HTMLTextAreaElement | null;
    const cur = text[idx] ?? "";
    const a = el?.selectionStart ?? cur.length;
    const z = el?.selectionEnd ?? a;
    setText({ ...text, [idx]: cur.slice(0, a) + v + cur.slice(z) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(a + v.length, a + v.length);
    });
  }

  return (
    <div className="player" ref={box}>
      <div className="row between">
        <div className="row">
          <Link href={back} className="btn ghost sm">
            ‹ Close
          </Link>
          <strong>{item.title}</strong>
        </div>
        <span className="small muted">
          {idx + 1} of {n}
        </span>
      </div>
      <div className="pbar" aria-hidden="true">
        <i style={{ width: `${Math.round(((idx + 1) / n) * 100)}%` }} />
      </div>

      {b.type === "slide" && (
        <div className="slide-card">
          <h2>{b.title}</h2>
          {paragraphs(b.body).map((p, k) => (
            <p key={k}>{p}</p>
          ))}
        </div>
      )}

      {b.type === "video" && (
        <div className="slide-card">
          <h2>{b.title || "Video"}</h2>
          <div className="video-box">
            <Icon name="play" className="ico-lg" />
            {/^https?:\/\//i.test(b.url) ? (
              <a className="btn primary" href={b.url} target="_blank" rel="noopener noreferrer">
                Open the video
              </a>
            ) : (
              <span className="muted">Your teacher has not added the video link yet.</span>
            )}
          </div>
          {b.note && <p>{b.note}</p>}
        </div>
      )}

      {b.type === "mcq" && (
        <div className="slide-card">
          <span className="label muted">Question</span>
          <h2 className="q">{b.question}</h2>
          <div className="opts">
            {b.options.map((o, k) => {
              if (!o.trim()) return null;
              const a = mcq[idx];
              const cls = a == null ? "" : k === b.correct ? " ok" : k === a ? " no" : " dim";
              return (
                <button key={k} type="button" className={`opt${cls}`} disabled={a != null} onClick={() => setMcq({ ...mcq, [idx]: k })}>
                  <span className="letter">{LETTERS[k]}</span>
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
          {mcq[idx] != null && (
            <div className={`fb ${mcq[idx] === b.correct ? "good" : "bad"}`}>
              <strong>{mcq[idx] === b.correct ? "Correct." : "Not quite."}</strong> {b.explain}
            </div>
          )}
        </div>
      )}

      {b.type === "written" && (
        <div className="slide-card">
          <span className="label muted">Written question · {plural(b.marks, "mark")}</span>
          <h2 className="q">{b.question}</h2>
          <label className="field" htmlFor={`w${idx}`}>
            <span>
              Your answer <span className="hint">Use the keys for maths</span>
            </span>
            <textarea id={`w${idx}`} rows={4} value={text[idx] ?? ""} readOnly={revealed[idx]} onChange={(e) => setText({ ...text, [idx]: e.target.value })} />
          </label>
          {!revealed[idx] && (
            <div className="keypad" role="group" aria-label="Maths keyboard">
              {KEYS.map(([label, v]) => (
                <button key={label} type="button" className="key" aria-label={`Insert ${label}`} onClick={() => typeKey(v)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="tex-preview">
            {(text[idx] ?? "").trim() ? toTeX(text[idx]).map((line, k) => <div key={`${k}-${line}`}>{line}</div>) : <span className="muted small">Your working appears here as maths.</span>}
          </div>
          {!revealed[idx] ? (
            <div className="row">
              <button type="button" className="btn primary" disabled={!(text[idx] ?? "").trim()} onClick={() => setRevealed({ ...revealed, [idx]: true })}>
                Check my answer
              </button>
            </div>
          ) : (
            <>
              <div className="fb good">
                <strong>Mark scheme.</strong> {b.markScheme || "Ask your teacher to go through this one."}
              </div>
              <label className="field" htmlFor={`m${idx}`}>
                <span>How many marks would you give yourself?</span>
                <select id={`m${idx}`} value={marks[idx] ?? ""} style={{ maxWidth: 160 }} onChange={(e) => setMarks({ ...marks, [idx]: Number(e.target.value) })}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {Array.from({ length: b.marks + 1 }, (_, m) => (
                    <option key={m} value={m}>
                      {m} / {b.marks}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      )}

      <div className="row between player-foot">
        <button type="button" className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!canGo || busy}
          onClick={() => {
            if (idx === n - 1) void finish();
            else {
              setIdx(idx + 1);
              window.scrollTo(0, 0);
            }
          }}
        >
          {idx === n - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
