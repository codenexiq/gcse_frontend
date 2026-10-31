"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { addStartupOption, deleteStartupOption, renameStartupOption } from "@/services/startupOptionService";
import type { StartupCategory, StartupOption } from "@/types";
import styles from "./StartupOptionsManager.module.css";

interface Props {
  category: StartupCategory;
  /** Plural name shown in the heading, e.g. "Subjects". */
  title: string;
  /** Singular name used in messages, e.g. "subject". */
  noun: string;
  options: StartupOption[];
  onAdded: (option: StartupOption) => void;
  onRenamed: (option: StartupOption) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
}

/** Add, rename and delete the choices of one dropdown. */
export default function StartupOptionsManager({ category, title, noun, options, onAdded, onRenamed, onDeleted, onClose }: Props) {
  const toast = useToast();
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  /** Runs one API call and shows an error toast if it fails. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const add = (e: FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    void run(async () => {
      onAdded(await addStartupOption(category, label));
      setNewLabel("");
      toast.success(`Added "${label}"`);
    });
  };

  const save = (e: FormEvent, id: number) => {
    e.preventDefault();
    const label = editLabel.trim();
    if (!label) return;
    void run(async () => {
      onRenamed(await renameStartupOption(id, label));
      setEditingId(null);
      toast.success("Saved");
    });
  };

  const remove = (id: number) =>
    void run(async () => {
      await deleteStartupOption(id);
      onDeleted(id);
      setConfirmId(null);
      toast.success("Deleted");
    });

  return (
    <section className={styles.panel} aria-label={`Manage ${title.toLowerCase()}`}>
      <div className={styles.head}>
        <h3 className={styles.title}>Manage {title.toLowerCase()}</h3>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <ul className={styles.list}>
        {options.map((o) => (
          <li key={o.id} className={styles.row}>
            {editingId === o.id ? (
              <form className={styles.editForm} onSubmit={(e) => save(e, o.id)}>
                <input className={styles.input} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} maxLength={60} aria-label={`New name for ${o.label}`} autoFocus />
                <button type="submit" className={styles.iconBtn} disabled={busy} aria-label="Save"><Check size={16} aria-hidden="true" /></button>
                <button type="button" className={styles.iconBtn} onClick={() => setEditingId(null)} aria-label="Cancel"><X size={16} aria-hidden="true" /></button>
              </form>
            ) : (
              <>
                <span className={styles.name}>{o.label}</span>
                {confirmId === o.id ? (
                  <span className={styles.confirm}>
                    Delete?
                    <button type="button" className={styles.danger} disabled={busy} onClick={() => remove(o.id)}>Yes, delete</button>
                    <button type="button" className={styles.textBtn} onClick={() => setConfirmId(null)}>Keep</button>
                  </span>
                ) : (
                  <span className={styles.actions}>
                    <button type="button" className={styles.iconBtn} onClick={() => { setEditingId(o.id); setEditLabel(o.label); setConfirmId(null); }} aria-label={`Edit ${o.label}`}>
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => { setConfirmId(o.id); setEditingId(null); }} aria-label={`Delete ${o.label}`}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </span>
                )}
              </>
            )}
          </li>
        ))}
        {options.length === 0 && <li className={styles.empty}>No choices yet.</li>}
      </ul>

      <form className={styles.addForm} onSubmit={add}>
        <input className={styles.input} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} maxLength={60} placeholder={`Add a ${noun}`} aria-label={`Add a ${noun}`} />
        <button type="submit" className={styles.addBtn} disabled={busy || !newLabel.trim()}>
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </form>
    </section>
  );
}
