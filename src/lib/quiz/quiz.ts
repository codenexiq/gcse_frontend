import type { DiagramPosition, QuizForTutor } from "@/types";

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

/** One question as a tutor types it in the quiz builder. */
export interface DraftQuestion {
  /** Only used as a React key, never sent. */
  key: number;
  question: string;
  /** The choices in order (A, B, C ...). Empty ones are left out. */
  options: string[];
  /** The index in `options` of the right choice, or -1 when none is chosen yet. */
  correct: number;
  explanation: string;
  marks: string;
  topic: string;
  /** The diagram as SVG text, or "". */
  svg: string;
  /** Where the diagram sits next to the question text. */
  position: DiagramPosition;
  /** Kept from a quiz being edited (the quiz builder has no boxes for these): the printed number and the written description of the diagram. */
  ref: string;
  description: string;
  /** When a quiz being edited had one picture shared by several questions: its name. Cleared as soon as this question gets a different picture. */
  sharedKey: string;
}

export const POSITIONS: { value: DiagramPosition; label: string }[] = [
  { value: "above", label: "Above the text" },
  { value: "below", label: "Below the text" },
  { value: "left", label: "Left of the text" },
  { value: "right", label: "Right of the text" },
];

export const MAX_CHOICES = LETTERS.length;
export const MIN_CHOICES = 2;

let nextKey = 1;
export const emptyQuestion = (): DraftQuestion => ({ key: nextKey++, question: "", options: ["", "", "", ""], correct: -1, explanation: "", marks: "1", topic: "", svg: "", position: "below", ref: "", description: "", sharedKey: "" });

/** A problem with the questions typed so far, in plain words, or "" when they are fine. The back-end checks everything again. */
export function draftProblem(title: string, questions: DraftQuestion[]): string {
  if (!title.trim()) return "Give the quiz a title.";
  for (const [i, q] of questions.entries()) {
    const n = `Question ${i + 1}`;
    if (!q.question.trim()) return `${n}: type the question.`;
    const filled = q.options.filter((o) => o.trim());
    if (filled.length < MIN_CHOICES) return `${n}: give at least ${MIN_CHOICES} choices.`;
    if (q.correct < 0 || !q.options[q.correct]?.trim()) return `${n}: mark which choice is correct.`;
    const marks = Number(q.marks);
    if (!Number.isInteger(marks) || marks < 1 || marks > 20) return `${n}: marks must be a whole number from 1 to 20.`;
  }
  return "";
}

/** The quiz file the back-end reads: the same shape as an uploaded .json file. */
export function buildQuizFile(meta: { title: string; subtitle: string; instructions: string }, questions: DraftQuestion[]) {
  // Pictures that several questions share stay shared (one copy is stored), under names of their own.
  const shared: Record<string, string> = {};
  const sharedName = new Map<string, string>();
  const file = {
    title: meta.title.trim(),
    ...(meta.subtitle.trim() ? { subtitle: meta.subtitle.trim() } : {}),
    ...(meta.instructions.trim() ? { instructions: meta.instructions.trim() } : {}),
    questions: questions.map((q, i) => {
      // Empty choices are dropped, and the letters follow the choices that are left.
      const kept = q.options.map((text, index) => ({ text: text.trim(), index })).filter((o) => o.text);
      const options = Object.fromEntries(kept.map((o, n) => [LETTERS[n], o.text]));
      const correct = LETTERS[kept.findIndex((o) => o.index === q.correct)];
      let picture: Record<string, string> = {};
      if (q.svg && q.sharedKey) {
        let name = sharedName.get(q.sharedKey);
        if (!name) {
          name = `shared${sharedName.size + 1}`;
          sharedName.set(q.sharedKey, name);
          shared[name] = q.svg;
        }
        picture = { diagramKey: name };
      } else if (q.svg) picture = { svg: q.svg };
      if (q.svg) picture = { ...picture, diagramPosition: q.position };
      return {
        ref: q.ref.trim() || `Q${i + 1}`,
        marks: Number(q.marks) || 1,
        ...(q.topic.trim() ? { topic: q.topic.trim() } : {}),
        ...(q.description.trim() ? { diagram: q.description.trim() } : {}),
        question: q.question.trim(),
        options,
        correct,
        ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
        ...picture,
      };
    }),
  };
  return Object.keys(shared).length ? { ...file, diagramSvgs: shared } : file;
}

/** A saved quiz as the builder's questions, so it can be edited. `diagrams` is the quiz's pictures by name. */
export function draftsFromQuiz(quiz: QuizForTutor, diagrams: Record<string, string>): DraftQuestion[] {
  const uses = new Map<string, number>();
  for (const q of quiz.questions) if (q.diagramKey) uses.set(q.diagramKey, (uses.get(q.diagramKey) ?? 0) + 1);
  return quiz.questions.map((q) => {
    const letters = Object.keys(q.options).sort();
    const key = q.diagramKey ?? "";
    return {
      key: emptyQuestion().key,
      question: q.question,
      options: letters.map((l) => q.options[l]),
      correct: letters.indexOf(q.correct),
      explanation: q.explanation,
      marks: String(q.marks),
      topic: q.topic,
      svg: key ? diagrams[key] ?? "" : "",
      position: q.diagramPosition ?? "below",
      ref: q.ref,
      description: q.diagram,
      sharedKey: key && (uses.get(key) ?? 0) > 1 ? key : "",
    };
  });
}
