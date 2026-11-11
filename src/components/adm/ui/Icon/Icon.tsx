import { ICON_PATHS } from "@/lib/icons";

/** One of the prototype's stroke icons. The inside of the picture is fixed text from lib/icons, never typed-in text. */
export default function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={`ico${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? ICON_PATHS.book }}
    />
  );
}
