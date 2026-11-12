import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import { greeting } from "@/lib/format";

/** The title block of the Teacher dashboard: a greeting by name, and a reminder that contact details are not shown here. */
export default function TutorPageHead({ name }: { name: string }) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">Teacher dashboard</span>
        <h1>
          {greeting()}, {name}
        </h1>
      </div>
      <Chip tone="c-out">
        <Icon name="lock" />
        Contact details hidden
      </Chip>
    </div>
  );
}
