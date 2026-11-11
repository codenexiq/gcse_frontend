import ScreenSide from "@/components/site/ScreenSide";

const OPTIONS: [string, string, boolean][] = [
  ["A", "x = 2, y = 5", false],
  ["B", "x = 4, y = 3", true],
  ["C", "x = 3, y = 4", false],
  ["D", "x = 9, y = −7", false],
];

/** Laptop screen: a quiz question with the right answer and the reason why. */
export default function ScreenQuiz() {
  return (
    <div className="ui">
      <ScreenSide on="Learning map" />
      <div className="ui-main">
        <div className="ui-row" style={{ justifyContent: "space-between" }}>
          <span>Quiz · Simultaneous equations</span>
          <span>Question 3 of 8</span>
        </div>
        <div className="ui-bar"><i style={{ width: "38%" }} /></div>
        <span className="ui-h">Solve 2x + y = 11 and x + y = 7</span>
        {OPTIONS.map(([letter, text, right]) => (
          <div key={letter} className={`ui-opt${right ? " ok" : ""}`}>
            <s>{letter}</s>
            {text}
            {right && <span style={{ marginLeft: "auto", color: "#2E8B66", fontWeight: 800 }}>Correct ✓</span>}
          </div>
        ))}
        <div className="ui-card" style={{ background: "#E7F3FA", boxShadow: "none" }}>
          <b>Why?</b>Subtract the equations to get x = 4, then substitute to find y = 3.
        </div>
      </div>
    </div>
  );
}
