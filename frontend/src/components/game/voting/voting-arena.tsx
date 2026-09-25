"use client";

import { useEffect, useRef } from "react";
import {
  Crosshair,
  Landmark,
  LockKeyhole,
} from "lucide-react";
import { motion } from "motion/react";
import { QuestionMedia } from "@/components/game/question/question-media";
import { cn } from "@/lib/utils";
import { animateSuccessIcon } from "@/animations/micro-interactions";
import { createVotingEntrance } from "@/animations/voting-animations";
import { useGsapContext } from "@/hooks/use-gsap-context";
import type { Question, VotingOption } from "@/types/question";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface VotingArenaProps {
  question: Question;
  options: VotingOption[];
  lockedOptionId: VotingOption["id"] | null;
  votingClosed?: boolean;
  onVote: (optionId: VotingOption["id"]) => void;
}

export function VotingArena({
  question,
  options,
  lockedOptionId,
  votingClosed = false,
  onVote,
}: VotingArenaProps) {
  const hasVoted = lockedOptionId !== null;
  const reducedMotion = useReducedMotion();
  const arena = useRef<HTMLElement>(null);

  useGsapContext(arena, () => {
    if (arena.current) createVotingEntrance(arena.current, Boolean(reducedMotion));
  }, [options.length, reducedMotion]);

  useEffect(() => {
    if (!lockedOptionId) return;
    const animation = animateSuccessIcon(
      arena.current?.querySelector<HTMLElement>("[data-vote-lock]") ?? null,
      Boolean(reducedMotion),
    );
    return () => { animation?.cancel(); };
  }, [lockedOptionId, reducedMotion]);
  return (
    <main ref={arena} className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <section
        className="flex w-full max-w-[900px] flex-col items-center text-center"
        aria-labelledby="voting-question"
      >
        <div className="mb-3 flex items-center gap-2 rounded-full border border-[#3f4366] bg-[#1c1c22] px-4 py-1.5 shadow-sm">
          <Landmark className="size-3.5 text-ring" aria-hidden="true" />
          <span className="font-ui text-xs font-bold tracking-[0.1em] text-ring">
            {question.category}
          </span>
        </div>

        <h1
          id="voting-question"
          className="max-w-[880px] text-balance font-display text-2xl font-extrabold leading-tight tracking-[-0.025em] text-foreground sm:text-[30px] sm:leading-9"
        >
          {question.text}
        </h1>

        {question.type === "IMAGE" && (
          <div className="mt-5 w-full max-w-[520px]">
            <QuestionMedia question={question} />
          </div>
        )}

        <div className="mt-4 flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs">
          <Crosshair className="size-4 shrink-0 text-destructive" aria-hidden="true" />
          <span className="font-ui font-bold tracking-[0.025em] text-destructive">
            FIND THE REAL ANSWER
          </span>
          <span className="text-[#a6a6ae]">
            Every option is anonymous. Choose carefully because your vote locks instantly.
          </span>
        </div>
      </section>

      {options.length > 0 ? (
        <section
          className="mt-5 grid w-full max-w-[1120px] grid-cols-2 items-stretch gap-2 sm:gap-3"
          aria-label="Anonymous voting options"
        >
          {options.map((option) => {
            const isSelected = lockedOptionId === option.id;
            const isDisabled = hasVoted || votingClosed;

            return (
              <motion.button
                key={option.id}
                data-voting-option
                transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.75 }}
                whileHover={!isDisabled && !reducedMotion ? { scale: 1.015, y: -2 } : undefined}
                whileTap={!isDisabled && !reducedMotion ? { scale: 0.97 } : undefined}
                animate={isSelected && !reducedMotion ? { scale: [1, 1.025, 1.02] } : { scale: 1 }}
                type="button"
                onClick={() => onVote(option.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={cn(
                  "group relative flex h-full items-center justify-center overflow-hidden rounded-xl border-2 px-2 py-3 text-center transition duration-200 sm:rounded-2xl sm:px-5 sm:py-4",
                  isSelected
                    ? "border-primary bg-[#211a1c] shadow-[0_0_0_1px_rgba(255,107,53,0.45),0_12px_30px_rgba(255,107,53,0.08)]"
                    : "border-[#2d2d38] bg-[#1c1c22] shadow-[0_4px_0_#0d0d10]",
                  !isDisabled && !isSelected &&
                    "hover:-translate-y-0.5 hover:border-[#4a4953]",
                  hasVoted && !isSelected && "opacity-45",
                  votingClosed && !hasVoted && "cursor-not-allowed opacity-55",
                )}
              >
                {isSelected && (
                  <span className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/20 blur-xl" />
                )}

                <span className="relative z-10 min-w-0 flex-1 px-2 sm:px-4">
                  <span className="block whitespace-normal break-words font-display text-sm font-bold leading-5 text-foreground sm:text-base sm:leading-6">
                    {option.text}
                  </span>
                  {isSelected && (
                    <span className="mt-1 flex items-center gap-1 font-ui text-[10px] font-bold tracking-[0.08em] text-primary">
                      <span data-vote-lock><LockKeyhole className="size-3" aria-hidden="true" /></span>
                      VOTE LOCKED
                    </span>
                  )}
                </span>

              </motion.button>
            );
          })}
        </section>
      ) : (
        <div className="mt-6 flex min-h-40 w-full max-w-[1120px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center text-sm text-muted-foreground">
          Waiting for submitted answers...
        </div>
      )}


    </main>
  );
}
