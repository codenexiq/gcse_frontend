import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import LogoutButton from "../LogoutButton";
import styles from "./UserMenu.module.css";

/** A soft avatar bubble with the user's email, plus the Log out button. */
export default function UserMenu({ user, onDone }: { user: User; onDone?: () => void }) {
  return (
    <div className={styles.menu}>
      <span className={styles.user} title={user.email}>
        <Avatar name={user.email} />
        <span className={styles.email}>{user.email}</span>
      </span>
      <LogoutButton onDone={onDone} />
    </div>
  );
}
