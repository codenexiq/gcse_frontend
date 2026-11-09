import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import DevFeedback from "@/components/dev/DevFeedback";
import MotionProvider from "@/components/ui/MotionProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: { default: "GCSE Cloud", template: "%s | GCSE Cloud" },
  description: "GCSE Cloud – Next.js, Express and MySQL project",
};

// Every page depends on who is logged in, so nothing is pre-built or cached.
export const dynamic = "force-dynamic";

// The root layout only holds what EVERY page needs. The header/footer live in the (site) group
// and the full-screen background lives in the (auth) group - see those layout files.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
        <DevFeedback />
      </body>
    </html>
  );
}
