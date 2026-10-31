import type { LucideIcon } from "lucide-react";
import FadeIn from "../FadeIn";
import styles from "./PageHeader.module.css";

/** Page title with an icon badge and optional subtitle. `icon` is a Lucide component. */
interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ icon: Icon, title, subtitle }: PageHeaderProps) {
  return (
    <FadeIn>
      <div className={styles.header}>
        {Icon && (
          <span className={styles.badge}>
            <Icon size={24} aria-hidden="true" />
          </span>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </FadeIn>
  );
}
