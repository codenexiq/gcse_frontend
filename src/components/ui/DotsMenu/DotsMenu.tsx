"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import styles from "./DotsMenu.module.css";

export interface DotsMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  /** "danger" is red, for things like Delete. */
  tone?: "default" | "danger";
}

interface Props {
  items: DotsMenuItem[];
  /** What screen readers say for the button, e.g. "Message options". */
  label: string;
  /** Which edge of the button the little menu lines up with. */
  align?: "left" | "right";
  /** "light" = white dots, for a dark background. */
  variant?: "default" | "light";
}

/** A "three dots" button that opens a small menu. Closes with Escape, a click elsewhere, or when an item is chosen. */
export default function DotsMenu({ items, label, align = "right", variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function onPointerDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      const entries = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      const at = entries.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      } else if (e.key === "ArrowDown" && entries.length > 0) {
        e.preventDefault();
        entries[(at + 1) % entries.length].focus();
      } else if (e.key === "ArrowUp" && entries.length > 0) {
        e.preventDefault();
        entries[(at - 1 + entries.length) % entries.length].focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrap} className={styles.wrap}>
      <button
        ref={button}
        type="button"
        className={`${styles.dots} ${variant === "light" ? styles.light : ""}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>
      {open && (
        <span id={menuId} role="menu" className={`${styles.menu} ${align === "right" ? styles.right : styles.left}`}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${styles.item} ${item.tone === "danger" ? styles.danger : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
