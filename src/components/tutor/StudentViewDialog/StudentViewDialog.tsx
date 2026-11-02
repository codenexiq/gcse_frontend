import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { studentAvatarUrl } from "@/services/profileService";
import { formatDate } from "@/utils/formatDate";
import type { StudentSummary } from "@/types";
import styles from "./StudentViewDialog.module.css";

/** A student's details at a glance (opened with the eye button). Nothing here can be changed. */
export default function StudentViewDialog({ student, onClose }: { student: StudentSummary; onClose: () => void }) {
  const name = student.full_name || "Name not given";
  const row = (label: string, value: string | null | undefined) => (
    <>
      <dt>{label}</dt>
      <dd>{value || <span className={styles.empty}>Not given yet</span>}</dd>
    </>
  );

  return (
    <ConfirmDialog open title="Student details" actions={[]} onClose={onClose} cancelLabel="Close">
      <div className={styles.who}>
        <Avatar name={student.full_name || student.email} size={52} src={student.avatar_version ? studentAvatarUrl(student.id, student.avatar_version) : null} />
        <div>
          <p className={styles.name}>{name}</p>
          <span className={`${styles.status} ${student.is_active === false ? styles.inactive : styles.active}`}>{student.is_active === false ? "Inactive" : "Active"}</span>
        </div>
      </div>
      <dl className={styles.facts}>
        {row("Student ID", student.student_code)}
        {row("Email", student.email)}
        {row("Joined", student.created_at ? formatDate(student.created_at) : null)}
        {row("Level", student.level)}
        {row("Subject", student.subject)}
        {row("School year", student.school_year)}
        {row("Headline", student.headline)}
        {row("Location", student.location)}
      </dl>
    </ConfirmDialog>
  );
}
