import Icon from "@/components/adm/ui/Icon";
import type { OverviewData } from "@/types/admin";

/** How many students are on each plan. */
export default function PlansCard({ plans }: { plans: OverviewData["plans"] }) {
  return (
    <section className="card">
      <h2>
        <Icon name="chart" /> Plans
      </h2>
      {plans.map((p) => (
        <div className="barrow" key={p.id}>
          <span>{p.name}</span>
          <span className="bar">
            <span style={{ width: `${p.percent}%` }} />
          </span>
          <strong>{p.count}</strong>
        </div>
      ))}
    </section>
  );
}
