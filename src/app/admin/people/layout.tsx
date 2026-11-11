import type { ReactNode } from "react";
import PeopleSwitch from "@/components/adm/admin/people/PeopleSwitch";

// Admin > People: the Students / Tutors / Groups switch stays while the page below changes.
export default function PeopleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PeopleSwitch />
      {children}
    </>
  );
}
