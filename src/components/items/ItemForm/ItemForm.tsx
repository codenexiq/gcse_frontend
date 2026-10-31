"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import FadeIn from "@/components/ui/FadeIn";
import { createItem } from "@/services/itemService";
import { useAsync } from "@/hooks/useAsync";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/useToast";
import styles from "./ItemForm.module.css";

export default function ItemForm() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState("");
  const { run, loading, error } = useAsync(createItem);
  // Loaded once and cached (memory + localStorage), not fetched on every visit.
  const { subjects, loading: loadingSubjects } = useSubjects();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const created = await run({
      title,
      description,
      ...(topicId && { topicId: Number(topicId) }),
    });
    if (created) {
      setTitle("");
      setDescription("");
      setTopicId("");
      toast.success("Your item was added to the list.", { title: "Item saved" });
      router.refresh(); // re-fetch the server-rendered list
    }
  }

  return (
    <FadeIn delay={0.1}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.heading}>
          <Plus size={20} aria-hidden="true" /> Add a new item
        </h2>
        <label className={styles.field}>
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Revise photosynthesis"
            required
            maxLength={100}
          />
        </label>
        <label className={styles.field}>
          <span>Topic (optional)</span>
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={loadingSubjects}>
            <option value="">{loadingSubjects ? "Loading topics…" : "No topic"}</option>
            {subjects.map((subject) => (
              <optgroup key={subject.id} label={subject.name}>
                {subject.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some extra detail…"
            rows={3}
          />
        </label>
        <Alert>{error}</Alert>
        <Button type="submit" variant="brand" size="md" disabled={loading} icon={loading ? undefined : <Save />}>
          {loading ? <Spinner size={18} label="Saving…" /> : "Save item"}
        </Button>
      </form>
    </FadeIn>
  );
}
