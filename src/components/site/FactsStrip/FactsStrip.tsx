const FACTS = [
  ["3–5", "students per live group"],
  ["KS3 to A-level", "Maths and Sciences"],
  ["Weekly", "live lessons, recorded"],
  ["Monthly", "progress reports for parents"],
];

/** Four coloured facts that overlap the bottom of the hero. */
export default function FactsStrip() {
  return (
    <div className="in facts-wrap">
      <div className="facts">
        {FACTS.map(([big, small]) => (
          <div key={big} className="fact">
            <b>{big}</b>
            <span>{small}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
