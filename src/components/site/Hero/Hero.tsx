import Link from "next/link";
import SiteIcon from "@/components/site/SiteIcon";
import Laptop from "@/components/site/Laptop";
import ScreenHome from "@/components/site/ScreenHome";

/** The top of the home page: the promise, two buttons and a laptop showing the platform. */
export default function Hero() {
  return (
    <section className="hero">
      <div className="in">
        <div className="stack" style={{ gap: 24 }}>
          <div className="levels"><span>Key Stage 3</span><span>GCSE</span><span>A-level</span></div>
          <h1>Small groups. A clear plan. <em>Real confidence.</em></h1>
          <p className="lead">Live Maths and Science lessons in groups of 3 to 5, with a personal learning map that shows every student exactly what to work on next.</p>
          <div className="row">
            <Link className="btn solid" href="/#contact">Book a free consultation <SiteIcon name="arrow" /></Link>
            <a className="btn" href="#tour"><SiteIcon name="play" size={16} />Watch the 2-minute tour</a>
          </div>
          <div className="hero-note">
            <span><SiteIcon name="check" />Experienced tutors</span>
            <span><SiteIcon name="check" />AQA, Edexcel and OCR</span>
            <span><SiteIcon name="check" />UK and international students</span>
          </div>
        </div>
        <div className="hero-vis">
          <div className="chip-float cf1">
            <span className="b" style={{ background: "var(--rose-soft)" }}><SiteIcon name="video" /></span>Live class · Thu 6pm
          </div>
          <Laptop><ScreenHome /></Laptop>
          <div className="chip-float cf2">
            <span className="b" style={{ background: "#DDF3E9", color: "#2E8B66" }}><SiteIcon name="check" /></span>Quiz: 8 out of 10
          </div>
        </div>
      </div>
    </section>
  );
}
