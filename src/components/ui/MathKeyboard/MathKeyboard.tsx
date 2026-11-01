"use client";

import styles from "./MathKeyboard.module.css";

interface Key { label: string; name: string; latex: string }

const GROUPS: { title: string; keys: Key[] }[] = [
  {
    title: "Basics",
    keys: [
      { label: "a/b", name: "Fraction", latex: "\\frac{}{}" },
      { label: "×", name: "Times", latex: "\\times" },
      { label: "÷", name: "Divide", latex: "\\div" },
      { label: "±", name: "Plus or minus", latex: "\\pm" },
      { label: "( )", name: "Brackets", latex: "()" },
      { label: "°", name: "Degrees", latex: "^{\\circ}" },
      { label: "%", name: "Percent", latex: "\\%" },
    ],
  },
  {
    title: "Powers and roots",
    keys: [
      { label: "x²", name: "Squared", latex: "^{2}" },
      { label: "x³", name: "Cubed", latex: "^{3}" },
      { label: "xⁿ", name: "Power", latex: "^{}" },
      { label: "x₁", name: "Subscript", latex: "_{}" },
      { label: "√", name: "Square root", latex: "\\sqrt{}" },
      { label: "∛", name: "Cube root", latex: "\\sqrt[3]{}" },
    ],
  },
  {
    title: "Symbols",
    keys: [
      { label: "π", name: "Pi", latex: "\\pi" },
      { label: "θ", name: "Theta", latex: "\\theta" },
      { label: "≤", name: "Less than or equal to", latex: "\\le" },
      { label: "≥", name: "Greater than or equal to", latex: "\\ge" },
      { label: "≠", name: "Not equal to", latex: "\\ne" },
      { label: "≈", name: "Approximately equal to", latex: "\\approx" },
      { label: "∞", name: "Infinity", latex: "\\infty" },
      { label: "→", name: "Arrow", latex: "\\rightarrow" },
    ],
  },
];

interface Props {
  /** Called with the LaTeX for the key that was pressed. */
  onInsert: (latex: string) => void;
}

/** A row of maths keys. They add LaTeX to the field being written, so the tutor never has to type backslashes. */
export default function MathKeyboard({ onInsert }: Props) {
  return (
    <div className={styles.keyboard} role="group" aria-label="Maths keyboard">
      {GROUPS.map((g) => (
        <div key={g.title} className={styles.group}>
          <span className={styles.title}>{g.title}</span>
          <div className={styles.keys}>
            {g.keys.map((k) => (
              <button
                key={k.name}
                type="button"
                className={styles.key}
                aria-label={k.name}
                title={k.name}
                // Keeps the caret in the text box while the key is pressed.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsert(k.latex)}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
