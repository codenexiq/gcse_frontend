import Icon from "@/components/adm/ui/Icon";

/** A number tile: an icon, a big number and what it counts. */
export default function Kpi({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="kpi">
      <Icon name={icon} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
