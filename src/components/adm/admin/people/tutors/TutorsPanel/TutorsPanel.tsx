"use client";

import { useState } from "react";
import TutorCard from "@/components/adm/admin/people/tutors/TutorCard";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { Subject, Tutor } from "@/types/admin";

/** All tutors, with a button to add one. Tutors only see the academic details of students assigned to them. */
export default function TutorsPanel({ initial, subjects }: { initial: Tutor[]; subjects: Subject[] }) {
  const toast = useToast();
  const [tutors, setTutors] = useState(initial);

  async function add() {
    try {
      const made = await send<Tutor>("POST", "/admin/people/tutors");
      setTutors((t) => [...t, made]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add a tutor.");
    }
  }

  return (
    <>
      <div className="row between">
        <p className="small muted">Tutors only see the academic details of students assigned to them.</p>
        <button type="button" className="btn primary sm" onClick={() => void add()}>
          <Icon name="plus" />
          Add tutor
        </button>
      </div>
      <div className="grid2">
        {tutors.map((t, i) => (
          <TutorCard key={t.id} tutor={t} index={i} subjects={subjects} />
        ))}
      </div>
    </>
  );
}
