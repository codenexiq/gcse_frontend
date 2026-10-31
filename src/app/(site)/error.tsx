"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import PageHeader from "@/components/ui/PageHeader";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section>
      <PageHeader icon={TriangleAlert} title="Something went wrong" subtitle={error.message} />
      <FadeIn delay={0.1}>
        <Button onClick={reset} icon={<RotateCcw />}>Try again</Button>
      </FadeIn>
    </section>
  );
}
