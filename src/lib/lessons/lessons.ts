import type { LessonBlock } from "@/types";

export const TYPE_LABEL: Record<LessonBlock["type"], string> = { slide: "Slide", video: "Video", mcq: "Multiple Choice Question", written: "Written Question" };

/** The six strands and their topics are read from the server; this is only the order of the lesson block types in the "add" row. */
export const ADD_TYPES: { type: LessonBlock["type"]; label: string }[] = [
  { type: "slide", label: "Slide" },
  { type: "video", label: "Video" },
  { type: "mcq", label: "Multiple choice" },
  { type: "written", label: "Written question" },
];

const newId = () => Math.random().toString(36).slice(2, 10);

export function newBlock(type: LessonBlock["type"]): LessonBlock {
  const id = newId();
  if (type === "slide") return { id, type, title: "", body: "" };
  if (type === "video") return { id, type, title: "", url: "", note: "" };
  if (type === "mcq") return { id, type, question: "", options: ["", "", "", ""], correct: 0, explain: "" };
  return { id, type: "written", question: "", markScheme: "", marks: 2 };
}

/** Only web addresses are opened from a lesson. */
export const safeLink = (url: string) => (/^https?:\/\//i.test(url.trim()) ? url.trim() : "");

/** Symbols a student can add to a written answer. */
export const KEYS: [string, string][] = [["x²", "^2"], ["xⁿ", "^"], ["√", "√("], ["a/b", "/"], ["π", "π"], ["×", "×"], ["÷", "÷"], ["(", "("], [")", ")"], ["±", "±"], ["≤", "≤"], ["≥", "≥"], ["≠", "≠"], ["°", "°"], ["θ", "θ"], ["=", "="]];

/** What a student typed in a written answer, one maths line per line: words stay words, symbols become maths. Returns text with $...$ around the maths. */
export function toMathLines(answer: string): string[] {
  return answer
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const parts: string[] = [];
      const words = /[A-Za-z]{2,}(?:[\s,.'’?!]+[A-Za-z]{2,})*[\s,.'’?!]*/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = words.exec(line))) {
        if (m.index > last) parts.push(math(line.slice(last, m.index)));
        parts.push(`\\text{${m[0].replace(/[{}\\$#%&_^~]/g, "")}}`);
        last = words.lastIndex;
      }
      if (last < line.length) parts.push(math(line.slice(last)));
      return `$${parts.join("")}$`;
    });
}

function math(s: string): string {
  return s
    .replace(/[{}\\$#%&_~]/g, "")
    .replace(/√\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/√(\d+|[a-z])/g, "\\sqrt{$1}")
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ")
    .replace(/±/g, "\\pm ")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/π/g, "\\pi ")
    .replace(/θ/g, "\\theta ")
    .replace(/°/g, "^{\\circ}")
    .replace(/\^\(([^()]*)\)/g, "^{$1}")
    .replace(/\^$/, "");
}

/** Questions pasted by a tutor: blocks separated by a blank line; "A) ..." lines are options and "Answer: B" marks the right one. Anything without options is a written question. */
export function parsePasted(text: string): LessonBlock[] {
  const out: LessonBlock[] = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    const options: string[] = [];
    const question: string[] = [];
    let answer: number | null = null;
    for (const l of lines) {
      const a = l.match(/^answer\s*[:\-]\s*([A-D])/i);
      const o = l.match(/^([A-D])[).:]\s*(.+)$/i);
      if (a) answer = "ABCD".indexOf(a[1].toUpperCase());
      else if (o) options.push(o[2]);
      else question.push(l);
    }
    const q = question.join(" ");
    if (!q) continue;
    if (options.length >= 2) {
      const four = options.slice(0, 4);
      while (four.length < 4) four.push("");
      out.push({ id: newId(), type: "mcq", question: q, options: four, correct: answer !== null && answer < four.length ? answer : 0, explain: "" });
    } else out.push({ id: newId(), type: "written", question: q, markScheme: "", marks: 2 });
  }
  return out;
}

/** A copy of a question with a new id, so it can go into another lesson. */
export const cloneBlock = (b: LessonBlock): LessonBlock => ({ ...b, id: newId() }) as LessonBlock;

/** A file as base64 (no data: prefix), for sending to the server. */
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsDataURL(file);
  });
}
