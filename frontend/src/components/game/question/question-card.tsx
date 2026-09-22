import { Eye, HelpCircle, ImageIcon } from "lucide-react";
import { QuestionMedia } from "./question-media";
import type { Question } from "@/types/question";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  currentRound: number;
  totalRounds: number;
  className?: string;
}

export function QuestionCard({
  question,
  currentRound,
  totalRounds,
  className,
}: QuestionCardProps) {
  const hasImage = question.type === "IMAGE";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-3xl border border-white/10 bg-[#19191f]/90 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-secondary/40 bg-secondary/20 text-ring">
            {hasImage ? (
              <ImageIcon className="size-4" aria-hidden="true" />
            ) : (
              <HelpCircle className="size-4" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs font-black tracking-[0.08em] text-ring sm:text-sm">
              {question.category}
            </p>
            <p className="mt-0.5 text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
              {hasImage ? "IMAGE QUESTION" : "TEXT QUESTION"}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[11px] font-bold text-[#a6a6ae]">
          ROUND {currentRound} / {totalRounds}
        </span>
      </div>

      <div
        className={cn(
          "p-5 sm:p-7 lg:p-8",
          hasImage && "grid items-center gap-7 lg:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        {hasImage && <QuestionMedia question={question} />}

        <div className={cn(!hasImage && "mx-auto max-w-4xl py-6 text-center sm:py-10")}>
          {!hasImage && (
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_rgba(255,107,53,0.12)]">
              <HelpCircle className="size-7" aria-hidden="true" />
            </div>
          )}

          <p className="mb-3 font-meta text-[11px] font-bold tracking-[0.16em] text-primary">
            THE QUESTION
          </p>
          <h1 className="text-balance font-display text-2xl font-black leading-tight tracking-[-0.025em] text-foreground sm:text-3xl lg:text-[2.15rem] lg:leading-[1.2]">
            {question.text}
          </h1>

          <div
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-[#a6a6ae]",
              !hasImage && "mx-auto",
            )}
          >
            <Eye className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span>Study the question, then write your best answer.</span>
          </div>
        </div>
      </div>
    </article>
  );
}
