import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";

/** The title block of the Admin dashboard. */
export default function PageHead() {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">Admin dashboard</span>
        <h1>Educate Cloud</h1>
      </div>
      <Chip tone="c-pink">
        <Icon name="shield" />
        Full access
      </Chip>
    </div>
  );
}
