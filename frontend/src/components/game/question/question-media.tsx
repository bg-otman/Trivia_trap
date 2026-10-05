import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Question } from "@/types/question";

interface QuestionMediaProps {
  question: Question;
}

export function QuestionMedia({ question }: QuestionMediaProps) {
  if (question.type !== "IMAGE") return null;

  if (!question.image) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-black/20 text-muted-foreground">
        <ImageIcon className="size-8" aria-hidden="true" />
        <p className="text-sm font-semibold">Question image unavailable</p>
      </div>
    );
  }

  return (
    <figure className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_18px_45px_rgba(0,0,0,0.32)]">
      <Image
        src={question.image}
        alt={question.imageAlt ?? "Visual clue for the question"}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/[0.04]"
        aria-hidden="true"
      />
      <figcaption className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-meta text-[10px] font-bold tracking-[0.1em] text-white/80 backdrop-blur-md">
        VISUAL CLUE
      </figcaption>
    </figure>
  );
}
