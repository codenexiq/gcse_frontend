import { getItems } from "@/services/itemService/itemService.server";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";
import ShapesBackground from "@/components/home/ShapesBackground";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";
import SubjectsMarquee from "@/components/home/SubjectsMarquee";
import FeatureGrid from "@/components/home/FeatureGrid";
import HowItWorks from "@/components/home/HowItWorks";
import CallToAction from "@/components/home/CallToAction";
import ScrollProgress from "@/components/ui/ScrollProgress";

// The home page is public: anyone can open it. Logged-in visitors just see a more personal version.
export default async function HomePage() {
  const user = await getCurrentUser();

  // The item count is a nice-to-have: if it fails the page still works.
  let itemCount: number | null = null;
  if (user?.role === "student") {
    try {
      itemCount = (await getItems()).length;
    } catch {}
  }

  const dashboardHref = user ? homePathFor(user.role) : null;

  return (
    <>
      <ShapesBackground />
      <ScrollProgress />
      <HeroSection dashboardHref={dashboardHref} />
      <StatsBand itemCount={itemCount} />
      <SubjectsMarquee />
      <FeatureGrid />
      <HowItWorks />
      <CallToAction dashboardHref={dashboardHref} />
    </>
  );
}
