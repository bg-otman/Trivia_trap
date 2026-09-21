"use client";

import { Check, Crosshair, Landmark, ShieldCheck, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnswerOption {
  id: "A" | "B" | "C" | "D";
  label: string;
}

interface VotingArenaProps {
  answers: AnswerOption[];
  selectedAnswer: AnswerOption["id"];
  hasVoted: boolean;
  onSelectAnswer: (answer: AnswerOption["id"]) => void;
  onCastVote: () => void;
}

export function VotingArena({
  answers,
  selectedAnswer,
  hasVoted,
  onSelectAnswer,
  onCastVote,
}: VotingArenaProps) {
  const selected =
    answers.find((answer) => answer.id === selectedAnswer) ?? answers[0];
  const voters = hasVoted ? 5 : 4;
  const remaining = 6 - voters;

  return (
    <main
      className="relative z-10 flex flex-1 flex-col items-center px-4 pb-5 pt-8 sm:px-6 lg:px-8 lg:pt-[58px]"
      data-node-id="1:1809"
    >
      <section
        className="flex w-full max-w-[896px] flex-col items-center text-center"
        aria-labelledby="trivia-question"
      >
        <div className="mb-2 flex items-center gap-2 rounded-full border border-[#3f4366] bg-[#1c1c22] px-4 py-1.5 shadow-sm">
          <Landmark className="size-3.5 text-ring" aria-hidden="true" />
          <span className="font-ui text-xs font-bold tracking-[0.1em] text-ring">
            HISTORY &amp; ARCHAEOLOGY
          </span>
        </div>

        <h1
          id="trivia-question"
          className="font-display max-w-[880px] text-balance text-2xl font-extrabold leading-tight tracking-[-0.025em] text-foreground sm:text-[30px] sm:leading-9"
        >
          Which ancient wonder was located in the city of Babylon and celebrated
          for its tiered stone terraces?
        </h1>

        <div className="mt-3 flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.1)] px-4 py-2 text-xs">
          <Crosshair
            className="size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <span className="font-ui font-bold tracking-[0.025em] text-destructive">
            WHICH ANSWER IS THE BLUFF?
          </span>
          <span className="text-[#a6a6ae]">
            — Choose the answer written by another player to expose their trap.
          </span>
        </div>
      </section>

      <section
        className="mt-4 grid w-full max-w-[1020px] grid-cols-1 gap-4 md:grid-cols-2"
        aria-label="Answer choices"
        data-node-id="1:1828"
      >
        {answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;

          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => !hasVoted && onSelectAnswer(answer.id)}
              disabled={hasVoted}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex min-h-24 items-center gap-5 overflow-hidden rounded-2xl border-2 px-6 py-3 text-left transition duration-200",
                isSelected
                  ? "border-primary bg-[#1f1b1e] shadow-[0_0_0_1px_rgba(255,107,53,0.5)]"
                  : "border-[#2d2d38] bg-[#1c1c22] shadow-[0_4px_0_0_#0d0d10] hover:-translate-y-0.5 hover:border-[#4a4953]",
                hasVoted && !isSelected && "opacity-55",
              )}
            >
              {isSelected && (
                <span className="absolute -right-8 -top-8 size-24 rounded-full bg-[rgba(255,107,53,0.2)] blur-xl" />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-xl border font-display text-lg font-black",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[#2d2d38] bg-[#131316] text-[#a6a6ae]",
                )}
              >
                {answer.id}
              </span>

              <span className="relative z-10 min-w-0 flex-1">
                <span className="block font-display text-lg font-bold leading-6 text-foreground sm:text-[18px]">
                  {answer.label}
                </span>
                {isSelected && (
                  <span className="mt-1 flex items-center gap-1 font-ui text-[11px] font-bold tracking-[0.05em] text-primary">
                    <Crosshair className="size-2.5" aria-hidden="true" />
                    {hasVoted ? "VOTE LOCKED" : "TARGETED TRAP"}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "relative z-10 flex shrink-0 items-center justify-center rounded-full",
                  isSelected
                    ? "size-7 bg-primary text-white"
                    : "size-6 border border-[#2d2d38]",
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="size-4" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </section>

      <section
        className="mt-4 flex w-full max-w-[1020px] flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#2d2d38] bg-[rgba(28,28,34,0.8)] p-[15px] backdrop-blur-md sm:flex-row sm:items-center"
        data-node-id="1:1868"
      >
        <div className="flex items-center gap-3 sm:pl-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.15)] text-[#4ade80]">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 text-xs">
              <span className="font-ui font-bold text-foreground">
                {hasVoted ? "Vote confirmed:" : "Ready to confirm selection:"}
              </span>
              <span className="font-ui font-extrabold uppercase text-primary">
                [{selected.id}] {selected.label}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-ui text-[11px]">
              <span className="size-1.5 rounded-full bg-[#4ade80]" />
              <span className="text-[#a6a6ae]">{voters} / 6 players voted</span>
              <span className="text-[rgba(166,166,174,0.4)]">•</span>
              <span className="text-muted-foreground">
                {remaining} {remaining === 1 ? "player" : "players"} still
                voting...
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCastVote}
          disabled={hasVoted}
          className={cn(
            "relative flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-display text-sm font-black tracking-[0.05em] text-white transition",
            hasVoted
              ? "cursor-default bg-[#5a3a2f] text-[#caa99d] shadow-none"
              : "bg-primary shadow-[0_5px_0_0_#832600,0_8px_24px_-4px_rgba(255,107,53,0.55)] hover:-translate-y-0.5 hover:bg-[#ff7848] active:translate-y-1 active:shadow-none",
          )}
        >
          {hasVoted ? (
            <Check className="size-4" />
          ) : (
            <Vote className="size-4" />
          )}
          {hasVoted ? "VOTE LOCKED" : "CAST VOTE"}
        </button>
      </section>
    </main>
  );
}
