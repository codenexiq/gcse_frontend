"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DiagnosticIntroCard from "@/components/tutor/DiagnosticIntroCard";
import DiagnosticIntroEditor from "@/components/tutor/DiagnosticIntroEditor";
import type { DiagnosticIntroContent } from "@/types";
import styles from "./DiagnosticIntroScreen.module.css";

interface Props {
  initialContent: DiagnosticIntroContent;
  /** Called after the wording was saved, so the parent keeps the new text. */
  onSaved: (saved: DiagnosticIntroContent) => void;
  level: string;
  subject: string;
  /** The Start diagnostic button. */
  onStart: () => void;
  /** Back to the start-up form. */
  onBack: () => void;
}

/** The screen shown after "Continue to diagnostic": the intro card, which a tutor can edit on the right. */
export default function DiagnosticIntroScreen({ initialContent, onSaved, level, subject, onStart, onBack }: Props) {
  const [saved, setSaved] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [editing, setEditing] = useState(false);

  const closeEditor = () => {
    setDraft(saved); // throw away unsaved changes
    setEditing(false);
  };

  return (
    <div className={`${styles.layout} ${editing ? styles.withEditor : ""}`}>
      <div className={styles.main}>
        <DiagnosticIntroCard
          content={editing ? draft : saved}
          level={level}
          subject={subject}
          onEdit={() => setEditing(true)}
          onStart={onStart}
        />
        <div>
          <Button variant="outline" size="md" onClick={onBack}>Back</Button>
        </div>
      </div>
      {editing && (
        <div className={styles.side}>
          <DiagnosticIntroEditor
            draft={draft}
            onChange={setDraft}
            onSaved={(s) => { setSaved(s); setDraft(s); setEditing(false); onSaved(s); }}
            onCancel={closeEditor}
          />
        </div>
      )}
    </div>
  );
}
