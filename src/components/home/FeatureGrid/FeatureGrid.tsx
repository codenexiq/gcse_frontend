import { FolderTree, Lock, Rocket, ShieldCheck, Zap } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "../FeatureCard";
import styles from "./FeatureGrid.module.css";

const features = [
  {
    icon: <ShieldCheck />,
    title: "Security you can trust",
    text: "Hashed passwords, locked-down cookies, CSRF protection and rate limiting keep every account safe.",
    wide: true,
  },
  {
    icon: <Zap />,
    title: "Lightning fast",
    text: "Subjects and topics load once and are cached, so the app never makes you wait twice.",
  },
  {
    icon: <FolderTree />,
    title: "Organised by topic",
    text: "Link every item to a subject and topic so you always know what to revise next.",
  },
  {
    icon: <Lock />,
    title: "Truly private",
    text: "Your items belong to you alone. Nobody else can see them.",
  },
  {
    icon: <Rocket />,
    title: "Built with modern tech",
    text: "Next.js 16, Express 5, TypeScript and MySQL, designed to be quick and easy to grow.",
    wide: true,
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className={styles.section}>
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to revise well"
        subtitle="A calm, fast and secure place to keep your studies on track."
      />
      <div className={styles.grid}>
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={(i % 3) * 0.1} />
        ))}
      </div>
    </section>
  );
}
