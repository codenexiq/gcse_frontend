import { FOUNDER } from "@/lib/siteContent";

/** The founder's story with her photo placeholder (her initials) and credentials. */
export default function Founder() {
  return (
    <div className="founder">
      <div className="portrait">
        <span className="mono">{FOUNDER.initials}</span>
      </div>
      <div className="stack" style={{ gap: 20 }}>
        <span className="eyebrow">Our founder</span>
        <h2>{FOUNDER.name}</h2>
        <p className="lead">{FOUNDER.quote}</p>
        <p className="muted">{FOUNDER.story}</p>
        <div className="creds">
          {FOUNDER.credentials.map(([title, sub]) => (
            <div key={title} className="cred">
              <b>{title}</b>
              <span>{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
