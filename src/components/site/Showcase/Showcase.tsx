import type { ReactNode } from "react";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";
import Laptop from "@/components/site/Laptop";
import ScreenQuiz from "@/components/site/ScreenQuiz";
import ScreenLive from "@/components/site/ScreenLive";
import ScreenReport from "@/components/site/ScreenReport";

const ROWS: { eyebrow: string; title: string; text: string; ticks: string[]; screen: ReactNode; flip: boolean }[] = [
  {
    eyebrow: "Between lessons", title: "Practice that tells you why", flip: false, screen: <ScreenQuiz />,
    text: "Short quizzes and lessons are set in the right order. Every answer gets an explanation, and written answers get feedback on the working.",
    ticks: ["Exam-style questions for your exam board", "Instant explanations", "Topics update on your learning map"],
  },
  {
    eyebrow: "Live classes", title: "Small groups with a real teacher", flip: true, screen: <ScreenLive />,
    text: "Every week students join the same tutor and the same small group on Zoom. Lessons are recorded, so nothing is lost if a student misses one.",
    ticks: ["3 to 5 students per group", "Recorded and added to the platform", "Notes and tasks set after every class"],
  },
  {
    eyebrow: "For parents", title: "A clear report every month", flip: false, screen: <ScreenReport />,
    text: "Parents see attendance, quiz results, topics covered and a note from the tutor, so they always know how things are going.",
    ticks: ["Written by your child’s tutor", "Progress against the target grade", "What comes next"],
  },
];

/** "Inside the platform": three features, each next to a laptop showing it. */
export default function Showcase() {
  return (
    <section className="band lav">
      <div className="in">
        <SectionHead eyebrow="Inside the platform" title="Everything a student needs, on one screen" />
        {ROWS.map((r) => (
          <div key={r.title} className={`show${r.flip ? " flip" : ""}`}>
            <div className="stack">
              <span className="eyebrow">{r.eyebrow}</span>
              <h3 style={{ fontSize: "clamp(26px,3vw,36px)" }}>{r.title}</h3>
              <p className="lead" style={{ fontSize: 17 }}>{r.text}</p>
              <ul className="ticks">
                {r.ticks.map((t) => (
                  <li key={t}>
                    <SiteIcon name="check" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Laptop>{r.screen}</Laptop>
          </div>
        ))}
      </div>
    </section>
  );
}
