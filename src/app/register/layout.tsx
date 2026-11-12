import type { ReactNode } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/admin.css";
import { ToastProvider } from "@/components/adm/ui/Toast";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-adm", display: "swap" });

// The sign-up pages use the same look as the dashboards: a simple top bar, then the wizard.
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`adm ${font.variable}`}>
      <ToastProvider>
        <header className="top">
          <div className="top-in">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Educate Cloud" />
              <span>Educate Cloud</span>
            </Link>
            <span />
            <div className="row top-r">
              <Link href="/login" className="btn ghost sm">
                Sign in
              </Link>
            </div>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </ToastProvider>
    </div>
  );
}
