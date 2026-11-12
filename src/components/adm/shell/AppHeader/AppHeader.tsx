import type { ReactNode } from "react";
import PanelSwitcher from "@/components/adm/shell/PanelSwitcher";
import SignOutButton from "@/components/adm/shell/SignOutButton";

/** The sticky top bar: logo, name of the area (a switch between the three panels for administrators) and Sign out. */
export default function AppHeader({ area, switcher = false, actions }: { area: string; switcher?: boolean; actions?: ReactNode }) {
  return (
    <header className="top">
      <div className="top-in">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Educate Cloud" />
          <span>Educate Cloud</span>
        </div>
        {switcher ? <PanelSwitcher area={area} /> : <span className="eyebrow">{area}</span>}
        <div className="row top-r">
          {actions}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
