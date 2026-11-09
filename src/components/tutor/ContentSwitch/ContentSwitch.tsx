import Link from "next/link";
import styles from "./ContentSwitch.module.css";

type Active = "library" | "routes";

const ITEMS: { key: Active; label: string; href: string }[] = [
  { key: "library", label: "Library", href: "/tutor/dashboard/lessons" },
  { key: "routes", label: "Learning routes", href: "/tutor/dashboard/routes" },
];

/** The switch under the Content tab: the selected item is filled (as the prototype's segmented control). */
export default function ContentSwitch({ active }: { active: Active }) {
  return (
    <nav className={styles.seg} aria-label="Content">
      {ITEMS.map((item) => (
        <Link key={item.key} href={item.href} className={styles.item} aria-current={item.key === active ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
