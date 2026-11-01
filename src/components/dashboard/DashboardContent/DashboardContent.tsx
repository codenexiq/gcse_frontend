"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Event the header sends once Refresh has finished loading the page's fresh data. */
export const DASHBOARD_REFRESHED = "dashboard:refreshed";

/**
 * Wraps the page. After a refresh the page is rebuilt from the fresh data, so lists that
 * copy their data when they first appear (like the question cards) show the new data too.
 */
export default function DashboardContent({ children, className }: { children: ReactNode; className?: string }) {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const onRefreshed = () => setVersion((v) => v + 1);
    window.addEventListener(DASHBOARD_REFRESHED, onRefreshed);
    return () => window.removeEventListener(DASHBOARD_REFRESHED, onRefreshed);
  }, []);
  return <div key={version} className={className}>{children}</div>;
}
