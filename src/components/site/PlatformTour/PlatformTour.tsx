"use client";

import { useEffect, useState } from "react";
import { TOUR, type SceneKey } from "@/lib/siteContent";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";

const SCENE_MS = 6000;

function Scene({ name }: { name: SceneKey }) {
  if (name === "diag") {
    return (
      <div className="sc-win">
        <span className="small" style={{ color: "#55657A" }}>GCSE Maths diagnostic · Question 4 of 10</span>
        <h5>Which is equal to (x + 3)²?</h5>
        <div className="sc-opt"><b>A</b>x² + 9</div>
        <div className="sc-opt ok"><b>B</b>x² + 6x + 9</div>
        <div className="sc-opt"><b>C</b>x² + 3x + 9</div>
        <div className="sc-opt" style={{ borderStyle: "dashed", color: "#55657A" }}><b>?</b>I haven’t learned this yet</div>
      </div>
    );
  }
  if (name === "map") {
    const cells: [string, string][] = [["Fractions", "m"], ["Percentages", "m"], ["Surds", "w"], ["Brackets", "p"], ["Quadratics", "w"], ["Sequences", "m"], ["Pythagoras", "p"], ["Trigonometry", "w"], ["Histograms", "m"]];
    return (
      <div className="sc-win">
        <h5>Your learning map</h5>
        <div className="sc-grid">
          {cells.map(([label, kind]) => (
            <div key={label} className={`sc-cell ${kind}`}>{label}</div>
          ))}
        </div>
      </div>
    );
  }
  if (name === "live") {
    return (
      <div className="sc-win">
        <h5>Thursday GCSE Maths · Live</h5>
        <div className="sc-call">
          <div className="sc-face t">Ms Zainab · Factorising quadratics</div>
          <div className="sc-face">A</div>
          <div className="sc-face">H</div>
          <div className="sc-face">Z</div>
        </div>
      </div>
    );
  }
  if (name === "tasks") {
    const tasks: [string, string][] = [["Notes: Expanding brackets", "Done ✓"], ["Video: Squaring a bracket", "Done ✓"], ["Quiz: Simultaneous equations", "Due Thu"]];
    return (
      <div className="sc-win">
        <h5>This week</h5>
        {tasks.map(([text, state]) => (
          <div key={text} className={`sc-opt${state.startsWith("Done") ? " ok" : ""}`}>
            <b>•</b>
            <span style={{ flex: 1 }}>{text}</span>
            <span>{state}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="sc-win">
      <h5>November report · Amira</h5>
      <span>Attended 4 of 4 classes. Covered quadratics and simultaneous equations. Quiz average 78%.</span>
      <div className="sc-bar"><i style={{ width: "78%" }} /></div>
      <span style={{ color: "#55657A" }}>Next month: trigonometry and circle theorems.</span>
    </div>
  );
}

/** The platform tour: five narrated scenes that advance by themselves. Play, pause and jump to any scene. */
export default function PlatformTour() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // People who ask their device for less motion start paused.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % TOUR.length), SCENE_MS);
    return () => clearTimeout(timer);
  }, [playing, index]);

  return (
    <section className="band ink" id="tour">
      <div className="in tour">
        <SectionHead eyebrow="Platform tour" title="See how a week at Educate Cloud works" lead="A two-minute walkthrough of the platform, from the first diagnostic to the monthly report." />
        <div className={`screen${playing ? "" : " paused"}`}>
          <span className="tag-live">Preview · narrated video coming soon</span>
          {TOUR.map((s, i) => (
            <div key={s.scene} className={`scene${i === index ? " on" : ""}`} aria-hidden={i !== index}>
              <Scene name={s.scene} />
            </div>
          ))}
          <div className="caption">
            <p aria-live="polite">{TOUR[index].line}</p>
            <div className="controls">
              <button type="button" className="play" aria-label={playing ? "Pause tour" : "Play tour"} onClick={() => setPlaying((p) => !p)}>
                <SiteIcon name={playing ? "pause" : "play"} />
              </button>
              <div className="prog">
                {TOUR.map((s, i) => (
                  <button key={s.scene} type="button" className={i < index ? "done" : i === index ? "cur" : ""} aria-label={`Scene ${i + 1}`} onClick={() => setIndex(i)}>
                    {/* The key restarts the filling animation each time this scene becomes the current one. */}
                    <i key={i === index ? `now-${index}` : "idle"} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <details className="script">
          <summary>Read the narration script</summary>
          <ol>
            {TOUR.map((s) => (
              <li key={s.scene}>{s.line}</li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
