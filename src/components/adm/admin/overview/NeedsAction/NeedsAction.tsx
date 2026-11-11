"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { Lookups, NeedsActionRow } from "@/types/admin";

/** New sign-ups and pathways without a tutor or class: choose them right here. Once a row is set up it leaves the list. */
export default function NeedsAction({ rows, lookups }: { rows: NeedsActionRow[]; lookups: Lookups }) {
  const router = useRouter();
  const toast = useToast();

  async function change(row: NeedsActionRow, body: { tutorId?: number | null; groupId?: number | null }) {
    try {
      await send("PUT", `/admin/people/enrolments/${row.enrolmentId}`, body);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    }
  }

  return (
    <section className="card">
      <h2>
        <Icon name="target" /> Needs action
      </h2>
      {rows.length === 0 ? (
        <p className="muted">All set. Every pathway has a tutor and a class.</p>
      ) : (
        <>
          <p className="small muted">New sign-ups and pathways without a tutor or class. Assign them here.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Pathway</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Tutor</th>
                  <th scope="col">Group</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.enrolmentId}>
                    <td>
                      <strong>{x.student.name}</strong>
                      <div className="small muted">{x.student.email}</div>
                    </td>
                    <td>{x.pathway}</td>
                    <td>{x.planName}</td>
                    <td>
                      <select id={`na-t-${x.enrolmentId}`} aria-label={`Tutor for ${x.student.name}`} defaultValue={x.tutorId ?? ""} onChange={(e) => void change(x, { tutorId: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">Choose tutor…</option>
                        {lookups.tutors
                          .filter((t) => t.subjects.includes(x.subjectId))
                          .map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <select id={`na-g-${x.enrolmentId}`} aria-label={`Group for ${x.student.name}`} defaultValue={x.groupId ?? ""} onChange={(e) => void change(x, { groupId: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">No group</option>
                        {lookups.groups
                          .filter((g) => g.subjectId === x.subjectId && g.levelId === x.levelId)
                          .map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
