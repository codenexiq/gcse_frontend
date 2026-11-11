import type { ReactNode } from "react";

/** A small rounded label. `tone` is one of c-lav, c-blue, c-pink, c-cream, c-navy, c-out. */
export default function Chip({ tone = "c-lav", children }: { tone?: string; children: ReactNode }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}
