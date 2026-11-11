const ITEMS = ["Home", "Learning map", "Live classes", "Messages", "Reports"];

/** The dark side menu on the laptop screens. `on` is the highlighted item. */
export default function ScreenSide({ on }: { on: string }) {
  return (
    <div className="ui-side">
      <div className="lg"><i />Educate Cloud</div>
      {ITEMS.map((x) => (
        <span key={x} className={x === on ? "on" : ""}>{x}</span>
      ))}
    </div>
  );
}
