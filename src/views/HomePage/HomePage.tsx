import Hero from "@/components/site/Hero";
import FactsStrip from "@/components/site/FactsStrip";
import Reviews from "@/components/site/Reviews";
import Mission from "@/components/site/Mission";
import Showcase from "@/components/site/Showcase";
import Courses from "@/components/site/Courses";
import PlatformTour from "@/components/site/PlatformTour";
import HowItWorksBand from "@/components/site/HowItWorksBand";
import Founder from "@/components/site/Founder";
import ShopBand from "@/components/site/ShopBand";
import BlogBand from "@/components/site/BlogBand";
import ContactSection from "@/components/site/ContactSection";
import { getPosts, getProducts, getReviews } from "@/services/siteService/siteService.server";
import { orEmpty } from "@/lib/siteData";

// The home page is public. Its reviews, shop packs and blog posts come from the database.
export default async function HomePage() {
  const [reviews, products, posts] = await Promise.all([
    orEmpty(getReviews(), { videos: [], google: [] }),
    orEmpty(getProducts(), []),
    orEmpty(getPosts(3), []),
  ]);

  return (
    <>
      <Hero />
      <FactsStrip />
      <Reviews reviews={reviews} />
      <Mission />
      <Showcase />
      <Courses />
      <PlatformTour />
      <HowItWorksBand />
      <section className="band cream">
        <div className="in"><Founder /></div>
      </section>
      <ShopBand products={products} />
      <BlogBand posts={posts} />
      <ContactSection />
    </>
  );
}
