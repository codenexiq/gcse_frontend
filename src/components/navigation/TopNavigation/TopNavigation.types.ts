import type { ReactNode } from "react";

export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface TopNavigationProps {
  /** The page links. Only list pages that exist. */
  items: NavigationItem[];
  brandLabel?: string;
  brandHref?: string;
  navigationLabel?: string;
  /** Extra things on the right of the bar (buttons, user menu...). */
  actions?: ReactNode;
}
