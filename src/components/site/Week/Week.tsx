import { WEEK } from "@/lib/siteContent";

/** What a typical week on the Weekly class plan looks like, day by day. */
export default function Week() {
  return (
    <div className="week">
      {WEEK.map(([day, events]) => (
        <div key={day} className="wd">
          <b>{day}</b>
          {events.map(([kind, text]) => (
            <span key={text} className={`ev ${kind}`}>{text}</span>
          ))}
          {events.length === 0 && <span className="small muted">Rest day</span>}
        </div>
      ))}
    </div>
  );
}
