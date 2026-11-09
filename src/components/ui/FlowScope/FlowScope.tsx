import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import styles from "./FlowScope.module.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

/**
 * Wraps the onboarding screens (student steps, groups, review) so they look like the Educate Cloud prototype:
 * the Plus Jakarta Sans font and the prototype's exact colours. Everything outside it is untouched.
 */
export default function FlowScope({ children }: { children: ReactNode }) {
  return <div className={`${jakarta.className} ${styles.scope}`}>{children}</div>;
}
