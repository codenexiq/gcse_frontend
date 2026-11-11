import PageHead from "@/components/site/PageHead";
import PostCard from "@/components/site/PostCard";
import CtaBand from "@/components/site/CtaBand";
import { getPosts } from "@/services/siteService/siteService.server";
import { orEmpty } from "@/lib/siteData";

export default async function BlogPage() {
  const posts = await orEmpty(getPosts(), []);
  // The featured post is shown wide at the top; the others follow, newest first.
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p !== featured);
  return (
    <>
      <PageHead eyebrow="Blog" title="Advice for students and parents" lead="Revision plans, study skills and support for exam season, written by our teachers." />
      <section className="band">
        <div className="in">
          {posts.length === 0 ? (
            <p className="muted">No articles yet. Please check back soon.</p>
          ) : (
            <div className="posts">
              {featured && <PostCard post={featured} feature />}
              {rest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
