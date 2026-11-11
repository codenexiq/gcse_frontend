"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParentCard from "@/components/adm/admin/people/students/ParentCard";
import StudentConversations from "@/components/adm/admin/people/students/StudentConversations";
import StudentDetailsCard from "@/components/adm/admin/people/students/StudentDetailsCard";
import StudentSubjects from "@/components/adm/admin/people/students/StudentSubjects";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import type { Enrolment, Lookups, StudentDetail } from "@/types/admin";

type Edit = Pick<StudentDetail, "name" | "email" | "level" | "year" | "plan" | "parent">;
const editOf = (s: StudentDetail): Edit => ({ name: s.name, email: s.email, level: s.level, year: s.year, plan: s.plan, parent: s.parent });

/** One student: details, parent contact, subjects (tutor and group for each), and conversations. Changes save as you go. */
export default function StudentProfile({ initial, lookups, isNew }: { initial: StudentDetail; lookups: Lookups; isNew: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [student, setStudent] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveDetails = useAutosave(async (edit: Edit) => {
    const saved = await send<StudentDetail>("PUT", `/admin/people/students/${student.id}`, edit);
    // The server may correct the year when the level changed.
    setStudent((s) => ({ ...s, year: saved.year, level: saved.level }));
  });

  function change(patch: Partial<Edit>, now = false) {
    const next = { ...editOf(student), ...patch };
    setStudent((s) => ({ ...s, ...patch }));
    saveDetails(next, now);
  }

  async function editEnrolment(id: number, patch: Partial<Enrolment>) {
    setStudent((s) => ({ ...s, enrolments: s.enrolments.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
    try {
      await send("PUT", `/admin/people/enrolments/${id}`, patch);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
      router.refresh();
    }
  }

  async function removeEnrolment(id: number) {
    try {
      await send("DELETE", `/admin/people/enrolments/${id}`);
      setStudent((s) => ({ ...s, enrolments: s.enrolments.filter((e) => e.id !== id) }));
      toast("Subject removed");
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be removed.");
    }
  }

  async function addEnrolment(subjectId: string) {
    try {
      const saved = await send<StudentDetail>("POST", `/admin/people/students/${student.id}/enrolments`, { subjectId });
      setStudent((s) => ({ ...s, enrolments: saved.enrolments }));
      const name = lookups.subjects.find((x) => x.id === subjectId)?.name ?? "Subject";
      toast(`${name} added. The student sees a new diagnostic.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be added.");
    }
  }

  async function deleteStudent() {
    try {
      await send("DELETE", `/admin/people/students/${student.id}`);
      toast("Student deleted");
      router.push("/admin/people/students");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be deleted.");
    }
  }

  async function passwordReset() {
    try {
      const res = await send<{ message: string }>("POST", `/admin/people/students/${student.id}/password-reset`);
      toast(res.message);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be sent.");
    }
  }

  return (
    <div className="stack">
      <div className="row between">
        <Link href="/admin/people/students" className="btn ghost sm">‹ All students</Link>
        <div className="row">
          <Link href={`/student?viewAs=${student.id}`} className="btn sm">View as this student</Link>
          {confirmDelete ? (
            <>
              <span className="small">Delete {student.name} and their data?</span>
              <button type="button" className="btn sm" onClick={() => void deleteStudent()}>Delete</button>
              <button type="button" className="btn ghost sm" onClick={() => setConfirmDelete(false)}>Keep</button>
            </>
          ) : (
            <button type="button" className="btn ghost sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" />
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="grid2">
        <div className="stack">
          <StudentDetailsCard student={student} levels={lookups.levels} plans={lookups.plans} focusName={isNew} onChange={(p, now) => change(p, now)} onPasswordReset={() => void passwordReset()} />
          <ParentCard parent={student.parent} onChange={(p) => change({ parent: { ...student.parent, ...p } })} />
        </div>
        <div className="stack">
          <StudentSubjects student={student} lookups={lookups} onEdit={(id, patch) => void editEnrolment(id, patch)} onRemove={(id) => void removeEnrolment(id)} onAdd={(id) => void addEnrolment(id)} />
          <StudentConversations conversations={student.conversations} />
        </div>
      </div>
    </div>
  );
}
