import katex from "katex";
import MathText from "@/components/ui/MathText";

/**
 * Lesson text: paragraphs are separated by a blank line, a paragraph written as $$...$$ stands on its own line as a display equation,
 * and maths between single dollar signs sits inside the sentence.
 */
export default function RichText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => {
        if (p.length > 4 && p.startsWith("$$") && p.endsWith("$$")) {
          const html = katex.renderToString(p.slice(2, -2), { throwOnError: false, trust: false, displayMode: true });
          return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return (
          <p key={i}>
            <MathText text={p} />
          </p>
        );
      })}
    </>
  );
}
