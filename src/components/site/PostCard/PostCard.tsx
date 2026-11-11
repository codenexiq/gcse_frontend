import { postColor, postDate } from "@/lib/siteContent";
import SiteIcon from "@/components/site/SiteIcon";
import type { SitePost } from "@/types";

/** One blog post. The featured post is wide, with a bigger heading. It opens the full article on our blog. */
export default function PostCard({ post, feature }: { post: SitePost; feature?: boolean }) {
  return (
    <a className={`post${feature ? " feature" : ""}`} href={post.url} target="_blank" rel="noopener noreferrer">
      <div className="cover" style={{ "--cv": postColor(post.color) } as React.CSSProperties}>
        <span>{post.tag}</span>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <div className="meta">
          <span>{postDate(post.publishedOn)}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
        <h4 style={feature ? { fontSize: "clamp(24px,3vw,34px)" } : undefined}>{post.title}</h4>
        <p>{post.excerpt}</p>
        <span className="small" style={{ fontWeight: 700, display: "inline-flex", gap: 6, alignItems: "center" }}>
          Read on our blog <SiteIcon name="ext" size={15} />
        </span>
      </div>
    </a>
  );
}
