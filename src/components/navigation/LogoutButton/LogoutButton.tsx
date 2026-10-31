"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { logout } from "@/services/authService";
import { useToast } from "@/hooks/useToast";
import styles from "./LogoutButton.module.css";

interface LogoutButtonProps {
  onDone?: () => void;
  /** "button" = a normal outlined button. "menu" = a row inside a drop-down menu. */
  variant?: "button" | "menu";
}

export default function LogoutButton({ onDone, variant = "button" }: LogoutButtonProps) {
  const router = useRouter();
  const toast = useToast();

  async function handleLogout() {
    try {
      await logout();
      toast.info("You have been logged out safely.", { title: "Logged out" });
    } finally {
      onDone?.();
      // replace (not push): the page you just left is swapped for the home page in the history,
      // so the Back button does not bring you straight back to a private page.
      router.replace("/");
      router.refresh();
    }
  }

  if (variant === "menu") {
    return (
      <button type="button" role="menuitem" className={styles.menuItem} onClick={handleLogout}>
        <LogOut size={16} aria-hidden="true" />
        Log out
      </button>
    );
  }

  return (
    <Button variant="outline" size="sm" icon={<LogOut />} onClick={handleLogout}>
      Log out
    </Button>
  );
}
