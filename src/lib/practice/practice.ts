import type { PlayerBlock } from "@/types/student";

type Mcq = Extract<PlayerBlock, { type: "mcq" }>;

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** A multiple-choice question: the right answer and up to three wrong ones, shuffled. */
function mcq(question: string, correct: string, wrongs: string[], explain: string): Mcq {
  const o = [correct];
  for (const w of wrongs) if (!o.includes(w) && o.length < 4) o.push(w);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return { type: "mcq", question, options: o, correct: o.indexOf(correct), explain };
}

/** Freshly made questions (new numbers each time) for the topics that have a generator. */
const GEN: Record<string, () => Mcq[]> = {
  Sequences: () =>
    Array.from({ length: 4 }, () => {
      const a = ri(2, 9), b = ri(1, 9), k = ri(5, 15), c = a * k + b;
      return mcq(`What is the term at position ${k} of the sequence $${a}n + ${b}$?`, `$${c}$`, [`$${c + a}$`, `$${a + b * k}$`, `$${a * k}$`], `Substitute $n = ${k}$: $${a}(${k}) + ${b} = ${c}$.`);
    }),
  "Expanding brackets": () =>
    Array.from({ length: 4 }, () => {
      const p = ri(2, 6);
      let q = ri(2, 7);
      if (p === q) q++;
      return mcq(`Expand $(x + ${p})(x + ${q})$`, `$x^2 + ${p + q}x + ${p * q}$`, [`$x^2 + ${p * q}x + ${p + q}$`, `$x^2 + ${p * q}$`, `$2x + ${p + q}$`], `Multiply every term: $x^2 + ${q}x + ${p}x + ${p * q}$.`);
    }),
  "Simultaneous equations": () =>
    Array.from({ length: 4 }, () => {
      const x = ri(1, 9), y = ri(1, 9);
      return mcq(`Solve $x + y = ${x + y}$ and $x - y = ${x - y}$`, `$x = ${x},\\ y = ${y}$`, [`$x = ${y},\\ y = ${x}$`, `$x = ${x + y},\\ y = ${x - y}$`, `$x = ${x + 1},\\ y = ${y - 1}$`], `Add the equations: $2x = ${2 * x}$, so $x = ${x}$ and $y = ${y}$.`);
    }),
};

/** A practice set: made-up questions for the topic first, then the teacher's own questions, up to six. */
export function practiceSet(topicName: string, bank: PlayerBlock[]): PlayerBlock[] {
  const made = GEN[topicName]?.() ?? [];
  const own = bank.filter((b) => b.type === "mcq" || b.type === "written");
  return [...made, ...own].slice(0, 6);
}
