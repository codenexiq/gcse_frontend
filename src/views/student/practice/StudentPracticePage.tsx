import { notFound } from "next/navigation";
import PracticePlayer from "@/components/adm/student/player/PracticePlayer";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { PlayerBlock } from "@/types/student";

interface Bank {
  enrolmentId: number;
  topic: { id: number; name: string };
  blocks: PlayerBlock[];
}

/** Student > a practice set on one topic. */
export default async function StudentPracticePage({ id, enrolment }: { id: string; enrolment?: string }) {
  if (!/^\d+$/.test(id) || !enrolment || !/^\d+$/.test(enrolment)) notFound();
  try {
    const bank = await serverFetch<Bank>(`/student/topics/${id}/practice?enrolment=${enrolment}`);
    return <PracticePlayer enrolmentId={bank.enrolmentId} topic={bank.topic} bank={bank.blocks} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
