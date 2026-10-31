import { FileQuestion, House } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import PageHeader from "@/components/ui/PageHeader";
import SiteShell from "@/components/layout/SiteShell";

// not-found lives outside the (site) group, so it wraps itself in the normal page frame.
export default function NotFound() {
  return (
    <SiteShell>
      <section>
        <PageHeader icon={FileQuestion} title="Page not found" subtitle="Sorry, that page does not exist." />
        <FadeIn delay={0.1}>
          <Button href="/" icon={<House />}>Go back home</Button>
        </FadeIn>
      </section>
    </SiteShell>
  );
}
