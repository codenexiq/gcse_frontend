"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import styles from "./ChatColorPicker.module.css";

/** Soft colours that keep the message bubbles easy to read, and one dark choice. null = the standard colour. */
const PRESETS: { name: string; color: string | null }[] = [
  { name: "Standard", color: null },
  { name: "Sky", color: "#dbeafe" },
  { name: "Mint", color: "#dff3e6" },
  { name: "Sunshine", color: "#fdf1d6" },
  { name: "Rose", color: "#fde3e8" },
  { name: "Lavender", color: "#e6dcf7" },
  { name: "Sand", color: "#f3e8d8" },
  { name: "Stone", color: "#e5e7eb" },
  { name: "Night", color: "#2b3350" },
];

/** What the standard colour looks like (shown in the colour box when nothing was chosen). */
export const STANDARD_CHAT_COLOR = "#e9edf6";

interface Props {
  /** The colour now, like #dff3e6, or null for the standard colour. */
  value: string | null;
  onChange: (color: string | null) => void;
}

/** A small palette button for the chat's title bar. It opens a few colours to choose from, and a box for any colour you like. */
export default function ChatColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isPreset = PRESETS.some((p) => p.color === value);

  return (
    <span ref={wrap} className={styles.wrap}>
      <button
        ref={button}
        type="button"
        className={styles.button}
        aria-label="Change the colour of the chat"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="Change the colour of the chat"
        onClick={() => setOpen((v) => !v)}
      >
        <Palette size={16} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label="Chat colour" className={styles.panel}>
          <p className={styles.title}>Chat colour</p>
          <ul className={styles.swatches}>
            {PRESETS.map((p) => {
              const selected = p.color === value;
              return (
                <li key={p.name}>
                  <button
                    type="button"
                    className={`${styles.swatch} ${selected ? styles.selected : ""}`}
                    style={{ background: p.color ?? STANDARD_CHAT_COLOR }}
                    onClick={() => onChange(p.color)}
                    aria-label={p.name}
                    aria-pressed={selected}
                    title={p.name}
                  >
                    {selected && <Check size={14} aria-hidden="true" className={p.name === "Night" ? styles.tickLight : styles.tick} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <label className={styles.custom}>
            <span>Any colour</span>
            <input type="color" value={value ?? STANDARD_CHAT_COLOR} onChange={(e) => onChange(e.target.value)} aria-label="Choose any colour" />
            {value && !isPreset && <span className={styles.code}>{value}</span>}
          </label>
          {value && (
            <button type="button" className={styles.reset} onClick={() => onChange(null)}>Back to the standard colour</button>
          )}
        </div>
      )}
    </span>
  );
}
