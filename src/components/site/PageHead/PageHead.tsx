/** The big heading at the top of every page except Home. */
export default function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="page-hero">
      <div className="in">
        <div className="head">
          <span className="eyebrow">{eyebrow}</span>
          <h1 style={{ fontSize: "clamp(36px,5vw,60px)" }}>{title}</h1>
          <p className="lead">{lead}</p>
        </div>
      </div>
    </section>
  );
}
