import { MAP_TILES } from "@/lib/siteContent";
import ScreenSide from "@/components/site/ScreenSide";

const TASKS: [string, string, string, boolean][] = [
  ["Notes: Expanding brackets", "#E6E6F8", "Done", true],
  ["Video: Squaring a bracket", "#BADCEE", "Done", true],
  ["Quiz: Simultaneous equations", "#FCE9EC", "Due Thu", false],
  ["Live class with Ms Zainab", "#FEFAD2", "Thu 6pm", false],
];

/** Laptop screen: a student's home page with this week's tasks and the learning map. */
export default function ScreenHome() {
  return (
    <div className="ui">
      <ScreenSide on="Home" />
      <div className="ui-main">
        <div className="ui-row" style={{ justifyContent: "space-between" }}>
          <span className="ui-h">Hi Amira</span>
          <span className="ui-pill" style={{ background: "#FEFAD2", borderColor: "transparent" }}>Weekly class</span>
        </div>
        <div className="ui-row">
          <span className="ui-pill on">GCSE Maths</span>
          <span className="ui-pill">GCSE Physics</span>
        </div>
        <div className="ui-grid">
          <div className="ui-card">
            <b>This week</b>
            {TASKS.map(([text, color, state, done]) => (
              <div key={text} className="ui-task">
                <i style={{ background: color }} />
                {text}
                <em className={done ? "ok" : ""}>{state}</em>
              </div>
            ))}
          </div>
          <div className="ui-card">
            <b>Learning map</b>
            <div className="ui-tiles">
              {MAP_TILES.map((t, i) => (
                <i key={i} className={t === "n" ? "" : t} />
              ))}
            </div>
            <div className="ui-stat">
              <div><b>14</b>mastered</div>
              <div><b>6</b>now</div>
              <div><b>8</b>target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
