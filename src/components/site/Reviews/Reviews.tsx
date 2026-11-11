import { CONTACT } from "@/lib/siteContent";
import SectionHead from "@/components/site/SectionHead";
import SiteIcon from "@/components/site/SiteIcon";
import type { SiteReviews, SiteVideoReview } from "@/types";

const CARD_COLORS = ["var(--sky)", "var(--lav)", "var(--cream)"];

function VideoCard({ video, tall }: { video: SiteVideoReview; tall?: boolean }) {
  return (
    <figure className={`vid${tall ? " tall" : ""}`}>
      <div className="frame">
        {video.videoUrl ? (
          <video src={video.videoUrl} poster={video.posterUrl ?? undefined} controls preload="none" playsInline aria-label={`Video review from ${video.name}`} />
        ) : (
          <>
            <span className="pl"><SiteIcon name="play" /></span>
            <span className="slot">Video review coming soon</span>
          </>
        )}
      </div>
      <figcaption className="cap">
        <b>{video.name}</b>
        <span>{video.about}</span>
      </figcaption>
    </figure>
  );
}

/** What families say: video reviews and written Google reviews. Both come from the database. */
export default function Reviews({ reviews }: { reviews: SiteReviews }) {
  const { videos, google } = reviews;
  // The heading and the Google link always show; the video and written reviews appear when there are some.
  return (
    <section className="band rose" id="reviews">
      <div className="in">
        <div className="rev-top">
          <SectionHead eyebrow="Reviews" title="What students and parents say" />
          <a className="g-sum" href={CONTACT.googleReviewsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stack" style={{ gap: 4 }}>
              <strong>Reviews on Google</strong>
              <span className="small muted">Read what families say</span>
            </div>
            <SiteIcon name="ext" size={16} />
          </a>
        </div>
        {videos.length > 0 && (
          <div className="vids">
            <div className="vid-main"><VideoCard video={videos[0]} tall /></div>
            <div className="vid-stack">
              {videos.slice(1).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        )}
        {google.length > 0 && (
          <div className="greviews">
            {google.map((r, k) => (
              <div key={r.id} className="grev" style={{ borderStyle: "solid", "--c": CARD_COLORS[k % 3] } as React.CSSProperties}>
                <div className="who">
                  <span className="av">{r.name.charAt(0)}</span>
                  <div>
                    <b>{r.name}</b>
                    <div className="small muted">{r.about}</div>
                  </div>
                  <span className="gtag">Google review</span>
                </div>
                {r.text.split("\n\n").map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="rev-note">
          <span className="small muted">{google.length > 0 ? "Shared from our Google reviews." : "Read what families say about us on Google."}</span>
          <a className="btn" href={CONTACT.googleReviewsUrl} target="_blank" rel="noopener noreferrer">
            Read all reviews on Google <SiteIcon name="ext" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
