/** The keys of the maths keyboard under a written answer: what is shown, and what is typed into the answer. */
export const KEYS: [string, string][] = [
  ["x²", "^2"], ["xⁿ", "^"], ["√", "√("], ["a/b", "/"], ["π", "π"], ["×", "×"], ["÷", "÷"], ["(", "("], [")", ")"], ["±", "±"], ["≤", "≤"], ["≥", "≥"], ["°", "°"], ["θ", "θ"], ["=", "="],
];

/** Turns what a student typed with the keyboard (x^2, √(9), 3/4 ...) into maths for display: one "$...$" string per line. */
export function toTeX(s: string): string[] {
  return String(s || "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      const parts: { m?: string; t?: string }[] = [];
      const re = /[A-Za-z]{2,}(?:[\s,.'?!]+[A-Za-z]{2,})*[\s,.'?!]*/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(l))) {
        if (m.index > last) parts.push({ m: l.slice(last, m.index) });
        parts.push({ t: m[0] });
        last = re.lastIndex;
      }
      if (last < l.length) parts.push({ m: l.slice(last) });
      const tex = parts
        .map((p) => {
          if (p.t != null) return `\\text{${p.t.replace(/[{}\\$#%&_^~]/g, "")}}`;
          return (p.m ?? "")
            .replace(/[{}\\$#%&_~]/g, "")
            .replace(/√\(([^()]*)\)/g, "\\sqrt{$1}")
            .replace(/√(\d+|[a-z])/g, "\\sqrt{$1}")
            .replace(/×/g, "\\times ")
            .replace(/÷/g, "\\div ")
            .replace(/±/g, "\\pm ")
            .replace(/≤/g, "\\le ")
            .replace(/≥/g, "\\ge ")
            .replace(/π/g, "\\pi ")
            .replace(/θ/g, "\\theta ")
            .replace(/°/g, "^{\\circ}")
            .replace(/\^\(([^()]*)\)/g, "^{$1}")
            .replace(/\^$/, "");
        })
        .join("");
      return `$${tex}$`;
    });
}
