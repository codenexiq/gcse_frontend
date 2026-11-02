"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDialog.module.css";

export interface DialogAction {
  label: string;
  onClick: () => void;
  /** "danger" is red, for things that cannot be undone. */
  tone?: "default" | "danger";
}

interface Props {
  open: boolean;
  title: string;
  /** The explanation under the title. */
  children?: ReactNode;
  /** The choices, shown as stacked buttons. A Cancel button is always added at the bottom. */
  actions: DialogAction[];
  onClose: () => void;
  /** While something is being done: the buttons are switched off and the dialog cannot be closed. */
  busy?: boolean;
  /** Shown in red when the action failed. */
  error?: string;
  cancelLabel?: string;
}

const FOCUSABLE = "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]";

/**
 * Our own pop-up, used instead of the browser's plain confirm box.
 * It closes with Escape or a click outside, keeps the keyboard inside while open, and gives focus back afterwards.
 */
export default function ConfirmDialog({ open, title, children, actions, onClose, busy = false, error, cancelLabel = "Cancel" }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const lockedScroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        // Keep Tab inside the dialog.
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = lockedScroll;
      before?.focus();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.title}>{title}</h2>
        {children && <div className={styles.text}>{children}</div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          {actions.map((a) => (
            <button key={a.label} type="button" className={`${styles.action} ${a.tone === "danger" ? styles.danger : ""}`} onClick={a.onClick} disabled={busy}>
              {a.label}
            </button>
          ))}
          <button type="button" className={`${styles.action} ${styles.cancel}`} onClick={onClose} disabled={busy}>{cancelLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
