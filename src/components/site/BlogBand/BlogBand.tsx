import Link from "next/link";
import PostCard from "@/components/site/PostCard";
import SiteIcon from "@/components/site/SiteIcon";
import type { SitePost } from "@/types";

/** The home page's "From the blog": the newest three posts. */
export default function BlogBand({ posts }: { posts: SitePost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="band sunk">
      <div className="in">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div className="head" style={{ margin: 0 }}>
            <span className="eyebrow">From the blog</span>
            <h2>Advice for students and parents</h2>
          </div>
          <Link className="link" href="/blog">
            All articles <SiteIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="posts">
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
