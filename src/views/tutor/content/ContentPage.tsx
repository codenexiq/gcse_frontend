import { notFound } from "next/navigation";
import ContentToolbar from "@/components/adm/tutor/content/ContentToolbar";
import ItemEditor from "@/components/adm/tutor/content/ItemEditor";
import Library from "@/components/adm/tutor/content/Library";
import RoutesPanel from "@/components/adm/tutor/content/RoutesPanel";
import Empty from "@/components/adm/ui/Empty";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { ContentItem, ContentPath, LibraryData, RouteDetail, RoutesData } from "@/types/tutor";

interface Props {
  path?: string;
  view?: string;
  item?: string;
  route?: string;
}

/** Teacher > Content: the library of lessons, notes, quizzes and videos, and the learning routes built from them. */
export default async function ContentPage({ path, view, item, route }: Props) {
  const paths = await serverFetch<ContentPath[]>("/tutor/content/paths");
  if (paths.length === 0) return <Empty title="No subjects yet" text="Ask the admin to add your subjects." />;

  // An item always opens in its own pathway.
  let editing: ContentItem | null = null;
  if (item && /^\d+$/.test(item)) {
    try {
      editing = await serverFetch<ContentItem>(`/tutor/content/items/${item}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }
  }
  const wanted = editing ? `${editing.subject}|${editing.level}` : path;
  const current = paths.find((p) => p.key === wanted) ?? paths[0];
  const query = `subject=${encodeURIComponent(current.subject.id)}&level=${encodeURIComponent(current.level.id)}`;

  if (view === "routes" && !editing) {
    const data = await serverFetch<RoutesData>(`/tutor/content/routes?${query}`);
    const id = data.routes.find((r) => String(r.id) === route)?.id ?? data.routes[0]?.id;
    const detail = id ? await serverFetch<RouteDetail>(`/tutor/content/routes/${id}`) : null;
    return (
      <>
        <ContentToolbar paths={paths} current={current} view="routes" />
        <RoutesPanel key={detail?.id ?? "none"} path={current} data={data} current={detail} />
      </>
    );
  }

  if (editing) {
    return (
      <>
        <ContentToolbar paths={paths} current={current} view="library" />
        <ItemEditor key={editing.id} initial={editing} />
      </>
    );
  }

  const library = await serverFetch<LibraryData>(`/tutor/content/library?${query}`);
  return (
    <>
      <ContentToolbar paths={paths} current={current} view="library" />
      <Library path={current} data={library} />
    </>
  );
}
