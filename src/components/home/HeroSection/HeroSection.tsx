import { ArrowRight, Check, LayoutDashboard } from "lucide-react";
import Button from "@/components/ui/Button";
import Stagger from "@/components/ui/Stagger";
import StaggerItem from "@/components/ui/StaggerItem";
import HeroImageSlider from "../HeroImageSlider";
import styles from "./HeroSection.module.css";

const highlights = [
  "Built around the 9–1 grading scale",
  "Topic-by-topic revision",
  "Track progress to your target grade",
];

/**
 * The opening section: headline and buttons on the left, the image slider on the right.
 * `dashboardHref` is where the signed-in user's dashboard is (null when logged out).
 */
export default function HeroSection({ dashboardHref }: { dashboardHref: string | null }) {
  return (
    <section aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.inner}>
        <Stagger staggerChildren={0.08} amount={0.1}>
          <StaggerItem>
            <p className={styles.pill}>
              <span aria-hidden="true" className={styles.pillDot} />
              Built for GCSE students
            </p>
          </StaggerItem>

          <StaggerItem>
            <h1 id="hero-heading" className={styles.title}>
              Make your next grade feel within reach.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className={styles.lead}>
              A calmer way to revise, practise exam questions and see how far you have come across your
              GCSE subjects.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className={styles.actions}>
              {dashboardHref ? (
                <Button href={dashboardHref} variant="brand" size="lg" icon={<LayoutDashboard />}>
                  Open my dashboard
                </Button>
              ) : (
                <Button href="/login" variant="brand" size="lg" iconRight={<ArrowRight />}>
                  Student log in
                </Button>
              )}
              <Button href="/#subjects" variant="outline" size="lg">
                Explore subjects
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <ul className={styles.highlights}>
              {highlights.map((item) => (
                <li key={item}>
                  <span className={styles.check}>
                    <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>

        <HeroImageSlider />
      </div>
    </section>
  );
}
