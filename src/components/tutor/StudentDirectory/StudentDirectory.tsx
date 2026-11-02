"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import StudentViewDialog from "@/components/tutor/StudentViewDialog";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { studentAvatarUrl } from "@/services/profileService";
import { bulkStudents, deleteStudent } from "@/services/studentAdminService";
import { formatDate } from "@/utils/formatDate";
import type { StudentSummary } from "@/types";
import styles from "./StudentDirectory.module.css";

const PAGE_SIZES = [10, 25, 50, 100];

/** What is open on top of the table. */
type Dialog = { kind: "view"; student: StudentSummary } | { kind: "delete"; student: StudentSummary } | { kind: "bulk-delete" };

const two = (n: number) => String(n).padStart(2, "0");

interface Props {
  students: StudentSummary[];
  /** Admins and tutors can add students, edit their profiles and switch them Active / Inactive. */
  canManage: boolean;
  /** Only admins can delete students (it removes everything of theirs for good). */
  canDelete: boolean;
}

/** The students table: search, filter by status, choose how many to show, and (for admins) add, edit, delete and act on several at once. */
export default function StudentDirectory({ students: initial, canManage, canDelete }: Props) {
  const toast = useToast();
  const [students, setStudents] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const active = s.is_active !== false;
      if (status === "active" && !active) return false;
      if (status === "inactive" && active) return false;
      return !q || `${s.full_name ?? ""} ${s.email} ${s.student_code ?? ""}`.toLowerCase().includes(q);
    });
  }, [students, query, status]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pages);
  const first = (current - 1) * pageSize;
  const rows = shown.slice(first, first + pageSize);

  // Going back to page 1 when the search, the filter or the page size changes.
  useEffect(() => setPage(1), [query, status, pageSize]);

  const allOnPage = rows.length > 0 && rows.every((s) => selected.has(s.id));
  const someOnPage = rows.some((s) => selected.has(s.id));
  const headerBox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  function toggle(id: number) {
    setSelected((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelected((old) => {
      const next = new Set(old);
      for (const s of rows) {
        if (allOnPage) next.delete(s.id);
        else next.add(s.id);
      }
      return next;
    });
  }

  function closeDialog() {
    setDialog(null);
    setDialogError("");
  }

  /** Runs a change on the server. The pop-up stays open, showing the reason, if it did not work. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setDialogError("");
    try {
      await action();
      closeDialog();
    } catch (err) {
      setDialogError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const removeOne = (s: StudentSummary) =>
    run(async () => {
      await deleteStudent(s.id);
      setStudents((all) => all.filter((x) => x.id !== s.id));
      setSelected((old) => {
        const next = new Set(old);
        next.delete(s.id);
        return next;
      });
      toast.success(`${s.full_name || s.email} was deleted.`, { title: "Student deleted" });
    });

  const bulk = (action: "activate" | "deactivate" | "delete") =>
    run(async () => {
      const ids = [...selected];
      const { changed } = await bulkStudents(ids, action);
      if (action === "delete") setStudents((all) => all.filter((s) => !selected.has(s.id)));
      else setStudents((all) => all.map((s) => (selected.has(s.id) ? { ...s, is_active: action === "activate" } : s)));
      setSelected(new Set());
      toast.success(`${changed} ${changed === 1 ? "student" : "students"} ${action === "delete" ? "deleted" : action === "activate" ? "set to Active" : "set to Inactive"}.`, { title: "Done" });
    });

  const count = shown.length === students.length ? `${students.length}` : `${shown.length} of ${students.length}`;

  return (
    <section className={styles.panel} aria-label="Student directory">
      <div className={styles.toolbar}>
        <label className={styles.show}>
          Show
          <select className={styles.select} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Students per page">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Search students by name, email or ID</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" maxLength={100} />
        </label>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className={styles.count}>{count} {students.length === 1 ? "student" : "students"}</span>
        {canManage && (
          <Link href="/tutor/dashboard/students/new" className={styles.add}>
            <Plus size={16} aria-hidden="true" /> Add New User
          </Link>
        )}
      </div>

      {canManage && selected.size > 0 && (
        <div className={styles.bulk} role="status">
          <strong>{selected.size} selected</strong>
          <button type="button" className={styles.bulkButton} onClick={() => bulk("activate")} disabled={busy}>Set Active</button>
          <button type="button" className={styles.bulkButton} onClick={() => bulk("deactivate")} disabled={busy}>Set Inactive</button>
          {canDelete && <button type="button" className={`${styles.bulkButton} ${styles.bulkDanger}`} onClick={() => setDialog({ kind: "bulk-delete" })} disabled={busy}>Delete</button>}
          <button type="button" className={styles.bulkClear} onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>{students.length === 0 ? "No students have registered yet." : "No students match your search."}</p>
      ) : (
        <>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {canManage && (
                    <th scope="col" className={styles.check}>
                      <input ref={headerBox} type="checkbox" checked={allOnPage} onChange={togglePage} aria-label="Select all students on this page" />
                    </th>
                  )}
                  <th scope="col">S.L</th>
                  <th scope="col">Student ID</th>
                  <th scope="col">Join Date</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Level</th>
                  <th scope="col" className={styles.center}>Status</th>
                  <th scope="col" className={styles.center}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const name = s.full_name || "Name not given";
                  const active = s.is_active !== false;
                  return (
                    <tr key={s.id}>
                      {canManage && (
                        <td className={styles.check}>
                          <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${name}`} />
                        </td>
                      )}
                      <td className={styles.serial}>{two(first + i + 1)}</td>
                      <td className={styles.code}>{s.student_code ?? "-"}</td>
                      <td className={styles.date}>{formatDate(s.created_at)}</td>
                      <td>
                        {/* The picture and the name open this student's monthly progress reports. */}
                        <Link href={`/tutor/dashboard/monthly-progress/student/${s.id}`} className={styles.who} title="Open monthly progress reports">
                          <Avatar name={s.full_name || s.email} size={40} src={s.avatar_version ? studentAvatarUrl(s.id, s.avatar_version) : null} />
                          <span className={styles.nameText}>{name}</span>
                        </Link>
                      </td>
                      <td className={styles.email}>{s.email}</td>
                      <td>{s.subject ?? <span className={styles.none}>-</span>}</td>
                      <td>{s.level ?? <span className={styles.none}>-</span>}</td>
                      <td className={styles.center}>
                        <span className={`${styles.badge} ${active ? styles.active : styles.inactive}`}>{active ? "Active" : "Inactive"}</span>
                      </td>
                      <td>
                        <span className={styles.actions}>
                          <button type="button" className={`${styles.icon} ${styles.view}`} onClick={() => setDialog({ kind: "view", student: s })} aria-label={`View ${name}`} title="View">
                            <Eye size={16} aria-hidden="true" />
                          </button>
                          {canManage && (
                            <Link href={`/tutor/dashboard/students/${s.id}`} className={`${styles.icon} ${styles.edit}`} aria-label={`Edit ${name}`} title="Edit profile">
                              <Pencil size={16} aria-hidden="true" />
                            </Link>
                          )}
                          {canDelete && (
                            <button type="button" className={`${styles.icon} ${styles.remove}`} onClick={() => setDialog({ kind: "delete", student: s })} aria-label={`Delete ${name}`} title="Delete">
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.footer}>
            <p className={styles.range}>Showing {first + 1}-{Math.min(first + pageSize, shown.length)} of {shown.length}</p>
            <div className={styles.pager}>
              <button type="button" className={styles.pageButton} onClick={() => setPage(current - 1)} disabled={current <= 1}>Previous</button>
              <span className={styles.pageNow}>Page {current} of {pages}</span>
              <button type="button" className={styles.pageButton} onClick={() => setPage(current + 1)} disabled={current >= pages}>Next</button>
            </div>
          </div>
        </>
      )}

      {dialog?.kind === "view" && <StudentViewDialog student={dialog.student} onClose={closeDialog} />}

      <ConfirmDialog
        open={dialog?.kind === "delete"}
        title="Delete this student?"
        actions={[{ label: "Delete student", tone: "danger", onClick: () => dialog?.kind === "delete" && removeOne(dialog.student) }]}
        onClose={closeDialog}
        busy={busy}
        error={dialogError}
      >
        <p>
          <strong>{dialog?.kind === "delete" ? dialog.student.full_name || dialog.student.email : ""}</strong> and everything of theirs (answers, chats, reports and pictures) is removed for good. This cannot be undone.
          To stop someone from signing in without losing anything, set them to Inactive instead.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.kind === "bulk-delete"}
        title={`Delete ${selected.size} ${selected.size === 1 ? "student" : "students"}?`}
        actions={[{ label: "Delete them", tone: "danger", onClick: () => bulk("delete") }]}
        onClose={closeDialog}
        busy={busy}
        error={dialogError}
      >
        <p>Every selected student and everything of theirs (answers, chats, reports and pictures) is removed for good. This cannot be undone.</p>
      </ConfirmDialog>
    </section>
  );
}
