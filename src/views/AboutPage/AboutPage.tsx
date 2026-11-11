import PageHead from "@/components/site/PageHead";
import Founder from "@/components/site/Founder";
import Mission from "@/components/site/Mission";
import SectionHead from "@/components/site/SectionHead";
import Team from "@/components/site/Team";
import CtaBand from "@/components/site/CtaBand";
import { getTeam } from "@/services/siteService/siteService.server";
import { orEmpty } from "@/lib/siteData";

export default async function AboutPage() {
  const tutors = await orEmpty(getTeam(), []);
  return (
    <>
      <PageHead eyebrow="About us" title="Teaching with care, structure and excellence" lead="Educate Cloud is a small team of teachers who believe every student can feel confident in Maths and Science with the right support." />
      <section className="band cream">
        <div className="in"><Founder /></div>
      </section>
      <Mission />
      <section className="band sunk">
        <div className="in">
          <SectionHead eyebrow="Our tutors" title="A small team, chosen carefully" lead="Every tutor is experienced in their subject and trained in our way of teaching." />
          {tutors.length > 0 ? <Team tutors={tutors} /> : <p className="muted">Our tutors’ profiles will be here shortly.</p>}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
