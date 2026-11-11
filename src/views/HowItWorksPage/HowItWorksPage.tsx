import PageHead from "@/components/site/PageHead";
import SectionHead from "@/components/site/SectionHead";
import Steps from "@/components/site/Steps";
import Week from "@/components/site/Week";
import Plans from "@/components/site/Plans";
import PlatformTour from "@/components/site/PlatformTour";
import Faq from "@/components/site/Faq";
import CtaBand from "@/components/site/CtaBand";

export default function HowItWorksPage() {
  return (
    <>
      <PageHead eyebrow="How it works" title="A clear plan from the first call" lead="Every student starts with a conversation and a diagnostic. Then they follow a weekly rhythm of live lessons and set tasks." />
      <section className="band">
        <div className="in"><Steps /></div>
      </section>
      <section className="band sunk">
        <div className="in">
          <SectionHead eyebrow="A typical week" title="What a week looks like on the Weekly class plan" lead="Around two hours in total. Tasks are short and spaced across the week." />
          <Week />
        </div>
      </section>
      <section className="band">
        <div className="in">
          <SectionHead eyebrow="Plans" title="Three ways to learn with us" lead="Prices are per subject. We confirm the price at your free consultation." />
          <Plans />
        </div>
      </section>
      <PlatformTour />
      <section className="band">
        <div className="in mission">
          <div className="head">
            <span className="eyebrow">Questions</span>
            <h2>Common questions</h2>
          </div>
          <Faq />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
