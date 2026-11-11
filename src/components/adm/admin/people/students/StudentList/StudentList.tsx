"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { StudentDetail, StudentListItem, Subject } from "@/types/admin";

/** Every student: search by name, email or parent, open a profile, or add a student. */
export default function StudentList({ students, subjects }: { students: StudentListItem[]; subjects: Subject[] }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();
  const shown = students.filter((s) => !q || `${s.name} ${s.email} ${s.parent.name} ${s.parent.email}`.toLowerCase().includes(q));

  function search(e?: FormEvent) {
    e?.preventDefault();
    setQuery(draft.trim());
  }

  async function add() {
    try {
      const made = await send<StudentDetail>("POST", "/admin/people/students");
      router.push(`/admin/people/students/${made.id}?new=1`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add a student.");
    }
  }

  const open = (id: number) => router.push(`/admin/people/students/${id}`);
  const onKey = (e: KeyboardEvent, id: number) => {
    if (e.key === "Enter") open(id);
  };

  return (
    <section className="card">
      <div className="row between">
        <h2>
          <Icon name="users" /> Students ({students.length})
        </h2>
        <form className="row" onSubmit={search}>
          <input type="search" className="search" placeholder="Search name or email" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Search students" />
          <button type="submit" className="btn sm">Search</button>
          <button type="button" className="btn primary sm" onClick={() => void add()}>
            <Icon name="plus" />
            Add student
          </button>
        </form>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Subjects</th>
              <th scope="col">Plan</th>
              <th scope="col">Parent</th>
              <th scope="col">Parent contact</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className="click" tabIndex={0} onClick={() => open(s.id)} onKeyDown={(e) => onKey(e, s.id)}>
                <td>
                  <strong>{s.name}</strong>
                  <div className="small muted">
                    {s.email} · {s.year}
                  </div>
                </td>
                <td>
                  <div className="row tight">
                    {s.enrolments.map((e) => {
                      const sub = subjects.find((x) => x.id === e.subjectId);
                      return (
                        <span key={e.id} title={e.pathName}>
                          <SubjectBadge icon={sub?.icon ?? "book"} color={sub?.color ?? "#4B596A"} size="sm" />
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td>{s.planName}</td>
                <td>{s.parent.name}</td>
                <td className="small">
                  {s.parent.email}
                  <br />
                  {s.parent.phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
