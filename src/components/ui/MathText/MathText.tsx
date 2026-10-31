import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Shows text where maths written between dollar signs is drawn properly:
 *   <MathText text="Work out $\frac{3}{4} + \frac{1}{6}$" />
 * Everything outside the dollar signs is plain text, and KaTeX is run with trust off, so this is safe for typed-in text.
 */
export default function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          const html = katex.renderToString(part.slice(1, -1), { throwOnError: false, trust: false, output: "html" });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
