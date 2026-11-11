import Link from "next/link";

/** The dark "Not sure where to start?" band at the bottom of the pages. */
export default function CtaBand() {
  return (
    <section className="band ink tight">
      <div className="in cta-band">
        <div className="stack" style={{ gap: 10, maxWidth: 640 }}>
          <h2>Not sure where to start?</h2>
          <p className="lead">Book a free 20-minute consultation. We will listen, suggest the right course and plan, and answer every question.</p>
        </div>
        <div className="row">
          <Link className="btn light solid" href="/#contact">Book a free consultation</Link>
          <Link className="btn light" href="/courses">Browse courses</Link>
        </div>
      </div>
    </section>
  );
}
