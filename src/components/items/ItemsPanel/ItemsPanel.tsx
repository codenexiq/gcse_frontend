import { redirect } from "next/navigation";
import { getItems } from "@/services/itemService/itemService.server";
import { ApiError } from "@/lib/api";
import type { Item } from "@/types";
import ItemList from "@/components/items/ItemList";
import ItemForm from "@/components/items/ItemForm";
import Alert from "@/components/ui/Alert";

/** The "add an item" form plus the list of the user's items. Shared by /items and the dashboard. */
export default async function ItemsPanel() {
  let items: Item[] = [];
  let error: string | null = null;

  try {
    items = await getItems();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login"); // session expired
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <>
      <ItemForm />
      {error ? <Alert>Could not load items: {error}</Alert> : <ItemList items={items} />}
    </>
  );
}
