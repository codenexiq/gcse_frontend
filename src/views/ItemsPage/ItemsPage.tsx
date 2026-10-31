import { Package } from "lucide-react";
import { requireUser } from "@/lib/session";
import ItemsPanel from "@/components/items/ItemsPanel";
import PageHeader from "@/components/ui/PageHeader";

export default async function ItemsPage() {
  await requireUser(); // not logged in -> /login

  return (
    <section>
      <PageHeader icon={Package} title="Items" subtitle="Add and view your own items. Only you can see them." />
      <ItemsPanel />
    </section>
  );
}
