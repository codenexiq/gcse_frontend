/** The letters used to label the choices. */
export const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** "2026-11-02T10:15:00.000Z" -> "2 Nov 2026" */
export function formatQuizDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** 18 of 24 -> 75 */
export function percent(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

/** "good" from 80%, "ok" from 50%, otherwise "low". Used to pick one flat colour. */
export function tone(score: number, total: number): "good" | "ok" | "low" {
  const p = percent(score, total);
  return p >= 80 ? "good" : p >= 50 ? "ok" : "low";
}

/** The address of a question's SVG picture. It is shown with <img>, so it can never run code on the page. */
export const diagramUrl = (quizId: number, key: string) => `/api/quizzes/${quizId}/diagrams/${encodeURIComponent(key)}`;

export type FilePreview = { ok: true; title: string; questions: number; marks: number; diagrams: number } | { ok: false; message: string };

/** A quick look at a chosen file, so a person sees what they are about to upload. The back-end still checks everything. */
export function previewQuizFile(data: unknown): FilePreview {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return { ok: false, message: "This is not a quiz file. It should be one JSON object with a \"title\" and a list of \"questions\"." };
  const file = data as { title?: unknown; questions?: unknown; diagramSvgs?: unknown };
  if (typeof file.title !== "string" || !file.title.trim()) return { ok: false, message: "The file needs a \"title\"." };
  if (!Array.isArray(file.questions) || file.questions.length === 0) return { ok: false, message: "The file needs a \"questions\" list with at least one question." };
  const marks = file.questions.reduce((sum: number, q) => sum + (typeof (q as { marks?: unknown })?.marks === "number" ? (q as { marks: number }).marks : 1), 0);
  // The pictures this quiz uses: named ones in diagramSvgs that a question points at, and SVGs written inside a question.
  const used = new Set<string>();
  for (const [i, q] of (file.questions as Record<string, unknown>[]).entries()) {
    if (typeof q?.svg === "string" || typeof q?.diagramSvg === "string") used.add(`own-${i}`);
    else {
      const key = q?.diagramKey ?? q?.diagramSvgKey;
      if (typeof key === "string" && key) used.add(key);
    }
  }
  return { ok: true, title: file.title.trim(), questions: file.questions.length, marks, diagrams: used.size };
}
