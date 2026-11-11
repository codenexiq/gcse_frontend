import LevelsPanel from "@/components/adm/admin/settings/levels/LevelsPanel";
import { serverFetch } from "@/lib/serverApi";
import type { LevelWithUse } from "@/types/admin";

/** Admin > Settings > Levels. */
export default async function LevelsPage() {
  return <LevelsPanel initial={await serverFetch<LevelWithUse[]>("/admin/settings/levels")} />;
}
