import { notFound } from "next/navigation";
import Player from "@/components/adm/student/player/Player";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { PlayerItem } from "@/types/student";

/** Student > a lesson, notes page, quiz or video, worked through one part at a time. */
export default async function StudentItemPage({ id, enrolment }: { id: string; enrolment?: string }) {
  if (!/^\d+$/.test(id) || !enrolment || !/^\d+$/.test(enrolment)) notFound();
  try {
    const item = await serverFetch<PlayerItem>(`/student/items/${id}?enrolment=${enrolment}`);
    return <Player key={item.id} item={item} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
