"use client";

import { useRef, useState } from "react";
import { FileUp, Shapes, Trash2 } from "lucide-react";
import DiagramEditor from "@/components/tutor/DiagramEditor";
import { POSITIONS } from "@/lib/quiz";
import type { DiagramPosition } from "@/types";
import styles from "./DiagramPicker.module.css";

const MAX_SVG_BYTES = 1_500_000;

interface Props {
  /** The question's diagram as SVG text, or "" for none. The picture itself is shown by the parent, inside the question box. */
  svg: string;
  onChange: (svg: string) => void;
  /** Where the diagram sits next to the question text. */
  position: DiagramPosition;
  onPosition: (position: DiagramPosition) => void;
}

/** The diagram buttons under a question box: draw one with the diagram editor, use an .svg file, remove it, and choose where it sits. */
export default function DiagramPicker({ svg, onChange, position, onPosition }: Props) {
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function fromFile(picked: File | undefined) {
    setError("");
    if (!picked) return;
    if (!/\.svg$/i.test(picked.name) && picked.type !== "image/svg+xml") return setError("Choose an .svg file.");
    if (picked.size > MAX_SVG_BYTES) return setError("That picture is over 1.5 MB. Use a smaller one.");
    const text = (await picked.text()).trim();
    if (!/<svg[\s>]/i.test(text)) return setError("That file does not look like an SVG picture.");
    onChange(text);
    setDrawing(false);
    if (file.current) file.current.value = "";
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <button type="button" className={styles.secondary} onClick={() => setDrawing((open) => !open)} aria-expanded={drawing}>
          <Shapes size={15} aria-hidden="true" /> {svg ? "Draw a different diagram" : "Draw a diagram"}
        </button>
        <button type="button" className={styles.secondary} onClick={() => file.current?.click()}>
          <FileUp size={15} aria-hidden="true" /> Use an SVG file
        </button>
        {svg && (
          <button type="button" className={styles.remove} onClick={() => onChange("")}>
            <Trash2 size={15} aria-hidden="true" /> Remove diagram
          </button>
        )}
        {svg && (
          <div className={styles.position} role="group" aria-label="Where the diagram sits">
            <span className={styles.positionLabel}>Diagram position</span>
            {POSITIONS.map((p) => (
              <button key={p.value} type="button" className={`${styles.pos} ${position === p.value ? styles.on : ""}`} aria-pressed={position === p.value} onClick={() => onPosition(p.value)}>
                {p.label.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
        <input ref={file} type="file" accept=".svg,image/svg+xml" className={styles.hidden} onChange={(e) => void fromFile(e.target.files?.[0])} aria-label="SVG file" />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}

      {drawing && (
        <div className={styles.box}>
          <DiagramEditor
            actions={({ svg: drawn }) => (
              <>
                <button type="button" className={styles.primary} disabled={!drawn} onClick={() => { onChange(drawn); setDrawing(false); }}>Use this diagram</button>
                <button type="button" className={styles.secondary} onClick={() => setDrawing(false)}>Cancel</button>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
