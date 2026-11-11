import PageHead from "@/components/site/PageHead";
import Courses from "@/components/site/Courses";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";
import CtaBand from "@/components/site/CtaBand";
import { INSIDE } from "@/lib/siteContent";

export default function CoursesPage() {
  return (
    <>
      <PageHead eyebrow="Courses" title="Find the right course" lead="Maths at every level, plus Science at Key Stage 3 and Physics, Chemistry and Biology at GCSE and A-level. Open any subject to see the topics and what is included." />
      <Courses full />
      <section className="band sunk">
        <div className="in">
          <SectionHead eyebrow="Inside every course" title="Everything a student needs, in one place" />
          <ul className="inside" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {INSIDE.map(([icon, title, text]) => (
              <li key={title}>
                <span className="k"><SiteIcon name={icon} /></span>
                <div>
                  <b>{title}</b>
                  <div className="small muted">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
