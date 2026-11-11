import { teamColor } from "@/lib/siteContent";
import SiteIcon from "@/components/site/SiteIcon";
import type { SiteTutor } from "@/types";

/** The tutors: a card each with their photo (or their initial), subjects and a short biography. */
export default function Team({ tutors }: { tutors: SiteTutor[] }) {
  return (
    <div className="team">
      {tutors.map((t) => (
        <article key={t.id} className="tutor" style={{ "--tc": teamColor(t.color) } as React.CSSProperties}>
          <div className="tutor-top">
            <div className="tphoto">
              {t.photoUrl ? <img src={t.photoUrl} alt={t.name} /> : <span>{t.name.charAt(0)}</span>}
              <span className="tbadge"><SiteIcon name={t.icon} /></span>
            </div>
            <div>
              <span className="eyebrow">Specialist subjects</span>
              <div className="tsub">{t.subjects}</div>
              <h3>{t.name}</h3>
            </div>
          </div>
          {t.bio.map((p) => (
            <p key={p} className="small muted">{p}</p>
          ))}
        </article>
      ))}
    </div>
  );
}
