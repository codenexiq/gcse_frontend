import SignOutButton from "@/components/adm/shell/SignOutButton";

/** The sticky top bar: logo, name of the area and Sign out. */
export default function AppHeader({ area }: { area: string }) {
  return (
    <header className="top">
      <div className="top-in">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Educate Cloud" />
          <span>Educate Cloud</span>
        </div>
        <span className="eyebrow">{area}</span>
        <div className="row top-r">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
