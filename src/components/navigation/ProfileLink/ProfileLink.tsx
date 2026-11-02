import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import styles from "./ProfileLink.module.css";

/** "My profile" as a row inside the account drop-down menu. */
export default function ProfileLink({ href, onDone }: { href: string; onDone?: () => void }) {
  return (
    <Link href={href} role="menuitem" className={styles.menuItem} onClick={onDone}>
      <CircleUserRound size={16} aria-hidden="true" />
      My profile
    </Link>
  );
}
