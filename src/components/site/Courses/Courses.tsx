"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { INSIDE, LEVELS, SUBJECTS, type Course, type Level } from "@/lib/siteContent";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";

function CourseCard({ course, level, open, onToggle }: { course: Course; level: Level; open: boolean; onToggle: () => void }) {
  const subject = SUBJECTS[course.subject];
  return (
    <button type="button" className="course" aria-expanded={open} onClick={onToggle} style={{ "--c": subject.color } as React.CSSProperties}>
      <span className="sub-ic"><SiteIcon name={course.subject} /></span>
      <div>
        <h3>{level.name} {subject.name}</h3>
        <p className="small muted">{level.boards}</p>
      </div>
      <ul>
        {course.strands.map(([strand]) => (
          <li key={strand}>{strand}</li>
        ))}
      </ul>
      <span className="more">
        {open ? "Hide what’s inside" : "See what’s inside"} <SiteIcon name="arrow" size={16} />
      </span>
    </button>
  );
}

/** The course chooser: pick a level, then open a subject to see its topics and what is included. `full` hides the intro (used on the Courses page). */
export default function Courses({ full }: { full?: boolean }) {
  const [levelId, setLevelId] = useState("gcse");
  const [open, setOpen] = useState<string | null>(null); // the open subject of the chosen level
  const detailRef = useRef<HTMLDivElement>(null);

  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[1];
  const current = level.courses.find((c) => c.subject === open) ?? null;

  function toggle(subject: string) {
    const next = open === subject ? null : subject;
    setOpen(next);
    if (next) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  return (
    <section className="band sky" id="courses-band">
      <div className="in">
        {!full && <SectionHead eyebrow="Courses" title="Maths and Science, from Key Stage 3 to A-level" lead="Choose a level, then open a subject to see exactly what is covered and what is included." />}
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="tabs" role="group" aria-label="Choose a level">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={l.id === levelId}
                onClick={() => {
                  setLevelId(l.id);
                  setOpen(null);
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
          <span className="small muted">{level.years} · {level.note}</span>
        </div>
        <div className="course-grid">
          {level.courses.map((c) => (
            <CourseCard key={c.subject} course={c} level={level} open={open === c.subject} onToggle={() => toggle(c.subject)} />
          ))}
        </div>
        {current && (
          <div className="detail" ref={detailRef}>
            <div className="stack">
              <div className="row">
                <span className="sub-ic" style={{ "--c": SUBJECTS[current.subject].color } as React.CSSProperties}><SiteIcon name={current.subject} /></span>
                <div>
                  <h3>{level.name} {SUBJECTS[current.subject].name}</h3>
                  <span className="small muted">{level.years} · {level.boards}</span>
                </div>
              </div>
              <span className="eyebrow">Topics covered</span>
              <div className="strands">
                {current.strands.map(([name, text]) => (
                  <div key={name} className="strand">
                    <b>{name}</b>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="stack">
              <span className="eyebrow">Inside every course</span>
              <ul className="inside">
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
              <div className="row">
                <Link className="btn solid" href="/#contact">Ask about this course</Link>
                <Link className="link" href="/how-it-works">See plans</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
