import Avatar from "@/components/ui/Avatar";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/utils/formatDate";
import type { TutorAccount } from "@/types";
import styles from "./TutorAccountsTable.module.css";

/** Every tutor and admin account. Only admins can open this page. */
export default function TutorAccountsTable({ accounts }: { accounts: TutorAccount[] }) {
  return (
    <section className={styles.panel} aria-label="Tutor accounts">
      <p className={styles.note}>
        New tutor accounts are created from the command line with <code>npm run tutor:create</code>.
      </p>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">Role</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <span className={styles.who}>
                    <Avatar name={account.email} size={32} />
                    {account.email}
                  </span>
                </td>
                <td>
                  <span className={`${styles.role} ${account.role === "admin" ? styles.admin : styles.tutor}`}>
                    {roleLabel(account.role)}
                  </span>
                </td>
                <td className={styles.date}>{formatDate(account.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
