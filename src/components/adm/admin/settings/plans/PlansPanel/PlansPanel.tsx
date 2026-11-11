import PlanCard from "@/components/adm/admin/settings/plans/PlanCard";
import type { Level, Plan } from "@/types/admin";

/** The plans students pick from at sign-up. */
export default function PlansPanel({ plans, levels }: { plans: Plan[]; levels: Level[] }) {
  return (
    <>
      <p className="small muted">Prices are placeholders until you decide. Students see these cards at sign-up step 2.</p>
      <div className="grid3">
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} index={i} levels={levels} />
        ))}
      </div>
    </>
  );
}
