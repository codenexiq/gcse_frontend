import type { NavItem, NavVariant } from "@/types";
import SegmentedNav from "../SegmentedNav";
import BubbleNav from "../BubbleNav";
import DotNav from "../DotNav";

interface NavMenuProps {
  links: NavItem[];
  /** Which soft style to use in the top bar. */
  variant?: NavVariant;
  /** "vertical" is the mobile menu (always the bubble style). */
  direction?: "horizontal" | "vertical";
  onNavigate?: () => void;
}

/** Picks one of the three soft menu styles. */
export default function NavMenu({
  links,
  variant = "segmented",
  direction = "horizontal",
  onNavigate,
}: NavMenuProps) {
  if (direction === "vertical") {
    return <BubbleNav links={links} direction="vertical" onNavigate={onNavigate} />;
  }
  if (variant === "bubbles") return <BubbleNav links={links} />;
  if (variant === "dots") return <DotNav links={links} />;
  return <SegmentedNav links={links} />;
}
