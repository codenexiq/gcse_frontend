import ScreenSide from "@/components/site/ScreenSide";

/** Laptop screen: a live small-group class with the tutor's board. */
export default function ScreenLive() {
  return (
    <div className="ui">
      <ScreenSide on="Live classes" />
      <div className="ui-main">
        <div className="ui-row" style={{ justifyContent: "space-between" }}>
          <span className="ui-h">Thursday GCSE Maths</span>
          <span className="ui-pill" style={{ background: "#EFA0AB", borderColor: "transparent" }}>● Live</span>
        </div>
        <div className="ui-faces">
          <div className="ui-face big" style={{ background: "#BADCEE" }}>
            <div className="ui-board">x² + 5x + 6 = (x + 2)(x + 3)</div>
            <small>Ms Zainab</small>
          </div>
          <div className="ui-face" style={{ background: "#E6E6F8" }}>A<small>Amira</small></div>
          <div className="ui-face" style={{ background: "#FEFAD2" }}>H<small>Hira</small></div>
        </div>
        <div className="ui-row">
          <span className="ui-pill">4 students</span>
          <span className="ui-pill">Recording on</span>
          <span className="ui-pill">Notes added after class</span>
        </div>
      </div>
    </div>
  );
}
