"use client";

import { useState } from "react";
import GroupCard from "@/components/adm/admin/people/groups/GroupCard";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { Group, Lookups } from "@/types/admin";

/** All live-class groups, with a button to add one. Students in a group see its routes and sessions. */
export default function GroupsPanel({ initial, lookups }: { initial: Group[]; lookups: Lookups }) {
  const toast = useToast();
  const [groups, setGroups] = useState(initial);

  async function add() {
    try {
      const made = await send<Group>("POST", "/admin/people/groups");
      setGroups((g) => [...g, made]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add a group.");
    }
  }

  return (
    <>
      <div className="row between">
        <p className="small muted">Groups are live classes. Students in a group see its routes and sessions.</p>
        <button type="button" className="btn primary sm" onClick={() => void add()}>
          <Icon name="plus" />
          Add group
        </button>
      </div>
      <div className="grid2">
        {groups.map((g, i) => (
          <GroupCard key={g.id} group={g} index={i} lookups={lookups} />
        ))}
      </div>
    </>
  );
}
