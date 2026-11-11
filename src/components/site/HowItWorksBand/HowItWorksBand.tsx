import Link from "next/link";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";
import Steps from "@/components/site/Steps";

/** The home page's short version of "How it works". */
export default function HowItWorksBand() {
  return (
    <section className="band">
      <div className="in">
        <SectionHead eyebrow="How it works" title="Four steps, then a rhythm that repeats" lead="Students always know what to do next. Parents always know how it is going." />
        <Steps />
        <div className="row" style={{ marginTop: 28 }}>
          <Link className="link" href="/how-it-works">
            Plans and a typical week <SiteIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
