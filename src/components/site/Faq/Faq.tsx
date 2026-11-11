import { FAQ } from "@/lib/siteContent";

/** Common questions: each one opens with a click (native details element, works without JavaScript). */
export default function Faq() {
  return (
    <div className="faq">
      {FAQ.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
