"use client";

import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";

/** Opens the Zoom lesson. (The prototype only says what the real app will do.) */
export default function JoinButton() {
  const toast = useToast();
  return (
    <button type="button" className="btn sm" onClick={() => toast("In the real app this opens the Zoom lesson.")}>
      <Icon name="video" />
      Join
    </button>
  );
}
