import ScreenSide from "@/components/site/ScreenSide";

const STATS: [string, string, string][] = [
  ["#BADCEE", "4/4", "classes"],
  ["#FCE9EC", "78%", "quiz average"],
  ["#FEFAD2", "+5", "topics mastered"],
];
const TOPICS: [string, number][] = [
  ["Factorising quadratics", 90],
  ["Simultaneous equations", 78],
  ["Rearranging formulae", 64],
];

/** Laptop screen: the monthly report a parent receives. */
export default function ScreenReport() {
  return (
    <div className="ui">
      <ScreenSide on="Reports" />
      <div className="ui-main">
        <span className="ui-h">November report · Amira</span>
        <div className="ui-stat">
          {STATS.map(([color, big, small]) => (
            <div key={small} style={{ background: color }}><b>{big}</b>{small}</div>
          ))}
        </div>
        <div className="ui-card">
          <b>From Ms Zainab</b>Amira has worked hard on quadratics this month and now factorises confidently. Next we will focus on trigonometry and circle theorems.
        </div>
        <div className="ui-card">
          <b>Topics covered</b>
          {TOPICS.map(([name, pct]) => (
            <div key={name} className="ui-row" style={{ flexWrap: "nowrap" }}>
              <span style={{ width: "45%" }}>{name}</span>
              <div className="ui-bar" style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div>
              <span>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
