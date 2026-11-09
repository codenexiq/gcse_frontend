"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DIAGRAM_TYPES, defaultValues, svgDataUrl, type DiagramType } from "@/lib/diagrams";
import styles from "./DiagramEditor.module.css";

interface Props {
  /** The buttons under the picture. They are given the drawn SVG, and a way to show a message. */
  actions: (api: { svg: string; setError: (message: string) => void }) => ReactNode;
}

/** Choose a diagram type, type the angles and see the picture at once. What happens to the picture is up to the buttons given. */
export default function DiagramEditor({ actions }: Props) {
  const [type, setType] = useState<DiagramType>(DIAGRAM_TYPES[0]);
  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(DIAGRAM_TYPES[0]));
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  // Drawing needs the browser, so it happens after the page has loaded.
  useEffect(() => {
    try {
      setSvg(type.draw(values));
      setError("");
    } catch {
      setError("That diagram could not be drawn. Check the numbers and try again.");
    }
  }, [type, values]);

  function choose(next: DiagramType) {
    setType(next);
    setValues(defaultValues(next));
  }

  return (
    <div className={styles.editor}>
      <div className={styles.types} role="tablist" aria-label="Diagram type">
        {DIAGRAM_TYPES.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === type.id} className={`${styles.type} ${t.id === type.id ? styles.current : ""}`} onClick={() => choose(t)}>
            {t.name}
          </button>
        ))}
      </div>

      <div className={styles.work}>
        <div className={styles.form}>
          <p className={styles.about}>{type.about}</p>
          {type.fields.map((f) => (
            <label key={f.key} className={styles.field}>
              <span className={styles.label}>{f.label}</span>
              {f.kind === "select" ? (
                <select className={styles.input} value={values[f.key]} onChange={(e) => setValues((old) => ({ ...old, [f.key]: e.target.value }))}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input className={styles.input} value={values[f.key]} maxLength={20} onChange={(e) => setValues((old) => ({ ...old, [f.key]: e.target.value }))} />
              )}
              {f.kind === "text" && f.hint && <span className={styles.hint}>{f.hint}</span>}
            </label>
          ))}
        </div>

        <div className={styles.preview}>
          <div className={styles.picture}>
            {/* An <img>, like the quiz page, so it looks exactly as students will see it. */}
            {svg ? <img src={svgDataUrl(svg)} alt={`Preview: ${type.name}`} /> : <span className={styles.wait}>Drawing…</span>}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>{actions({ svg, setError })}</div>
        </div>
      </div>
    </div>
  );
}
