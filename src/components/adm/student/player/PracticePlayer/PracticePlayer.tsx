"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Player from "@/components/adm/student/player/Player";
import Empty from "@/components/adm/ui/Empty";
import { practiceSet } from "@/lib/practice";
import type { PlayerBlock } from "@/types/student";

interface Props {
  enrolmentId: number;
  topic: { id: number; name: string };
  /** The teacher's own questions on this topic. */
  bank: PlayerBlock[];
}

/** A practice set on one topic: new made-up questions (where there is a generator) plus the teacher's own. "New questions" starts another set. */
export default function PracticePlayer({ enrolmentId, topic, bank }: Props) {
  const [round, setRound] = useState(0);
  const [blocks, setBlocks] = useState<PlayerBlock[] | null>(null);

  // The questions are made in the browser (random numbers), so they are made after the page has loaded.
  useEffect(() => {
    setBlocks(practiceSet(topic.name, bank));
  }, [round, topic.name, bank]);

  if (!blocks) return null;
  if (blocks.length === 0) {
    return (
      <div className="narrow stack">
        <Empty title="No practice questions yet" text="There are no questions on this topic yet. Message your teacher to ask for some." />
        <Link href={`/student?enrolment=${enrolmentId}`} className="btn primary">
          Back to my map
        </Link>
      </div>
    );
  }
  return (
    <Player
      key={round}
      item={{ id: 0, enrolmentId, kind: "quiz", title: `Practice: ${topic.name}`, topicId: topic.id, done: false, blocks }}
      practice={{ topicId: topic.id, onAgain: () => setRound((r) => r + 1) }}
    />
  );
}
