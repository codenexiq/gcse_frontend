"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { contentHref } from "@/lib/content";
import type { ContentPath } from "@/types/tutor";

/** The top of the Content tab: which subject and level, and Library or Learning routes. */
export default function ContentToolbar({ paths, current, view }: { paths: ContentPath[]; current: ContentPath; view: "library" | "routes" }) {
  const router = useRouter();
  const go = (key: string) => router.push(contentHref({ path: key, view: view === "routes" ? "routes" : undefined }));
  return (
    <div className="row between toolbar">
      <div className="row">
        <SubjectBadge icon={current.subject.icon} color={current.subject.color} />
        <label className="field inline" htmlFor="c-path">
          <span>Pathway</span>
          <select id="c-path" value={current.key} onChange={(e) => go(e.target.value)}>
            {paths.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="seg" role="group" aria-label="Content view">
        <Link href={contentHref({ path: current.key })} className="seg-link" aria-current={view === "library" ? "page" : undefined}>
          <Icon name="book" />
          Library
        </Link>
        <Link href={contentHref({ path: current.key, view: "routes" })} className="seg-link" aria-current={view === "routes" ? "page" : undefined}>
          <Icon name="route" />
          Learning routes
        </Link>
      </div>
    </div>
  );
}
