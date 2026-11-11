import Link from "next/link";
import { PILLARS } from "@/lib/siteContent";
import SiteIcon from "@/components/site/SiteIcon";

/** "What we are about": the mission and the four pillars of the teaching. */
export default function Mission() {
  return (
    <section className="band">
      <div className="in mission">
        <div className="stack" style={{ gap: 22 }}>
          <span className="eyebrow">What we are about</span>
          <blockquote>A high-quality place to learn, where students feel confident to make mistakes and thrive academically and personally.</blockquote>
          <p className="muted">That is our mission. We combine strong teaching with the right technology, and we care about the whole student, not only the grade.</p>
          <Link className="link" href="/about">
            Meet the team <SiteIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="pillars">
          {PILLARS.map(([icon, title, text]) => (
            <div key={title} className="pillar">
              <span className="ic"><SiteIcon name={icon} /></span>
              <h4>{title}</h4>
              <p className="small muted">{text}</p>
            </div>
          ))}
          <div className="pillar excel">
            <span className="big">Everything with excellence.</span>
            <p className="small">Our motto. Every lesson, every report and every message is done as well as it can be done.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
