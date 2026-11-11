"use client";

import { useRouter } from "next/navigation";
import { send } from "@/lib/api";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await send("POST", "/auth/logout").catch(() => {});
    router.push("/login");
    router.refresh();
  }
  return (
    <button type="button" className="btn ghost sm" onClick={() => void signOut()}>
      Sign out
    </button>
  );
}
