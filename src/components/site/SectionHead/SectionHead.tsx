/** The small label, big heading and short intro that open a band of the page. */
export default function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}
