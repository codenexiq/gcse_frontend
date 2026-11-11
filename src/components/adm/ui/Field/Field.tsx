import type { ReactNode } from "react";

/** A label above a form control (the control sits inside the label, as in the prototype). */
export default function Field({ id, label, hint, children }: { id: string; label: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {hint && <> <span className="hint">{hint}</span></>}
      </span>
      {children}
    </label>
  );
}
