import { STEPS } from "@/lib/siteContent";

/** The four numbered steps from the first call to the monthly report. */
export default function Steps() {
  return (
    <ol className="steps">
      {STEPS.map(([when, title, text]) => (
        <li key={title}>
          <span className="when">{when}</span>
          <h4>{title}</h4>
          <p className="small muted">{text}</p>
        </li>
      ))}
    </ol>
  );
}
