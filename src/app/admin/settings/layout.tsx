import type { ReactNode } from "react";
import SettingsSwitch from "@/components/adm/admin/settings/SettingsSwitch";

// Admin > Settings: the Levels / Subjects / Topics / Plans / Sign-up switch stays while the page below changes.
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsSwitch />
      {children}
    </>
  );
}
