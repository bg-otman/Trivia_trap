import { CheckCircle2, Crown, UserRound, Vote } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import type { RevealedSubmission } from "@/types/results";

interface CorrectAnswerCardProps {
  answer: string;
  voterNames?: string[];
}

export function CorrectAnswerCard({
  answer,
  voterNames = [],
}: CorrectAnswerCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/50 bg-[linear-gradient(135deg,rgba(247,201,72,0.18),rgba(247,201,72,0.06))] px-5 py-6 shadow-[0_18px_55px_rgba(247,201,72,0.12)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
          <Crown className="size-5 fill-current" aria-hidden="true" />
        </div>
        <p className="mt-4 font-meta text-[11px] font-black tracking-[0.16em] text-accent">
          THE REAL ANSWER
        </p>
        <p dir="auto" className="mx-auto mt-2 max-w-3xl text-balance font-display text-2xl font-black leading-tight text-white sm:text-3xl">
          {answer}
        </p>
        <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-accent/25 bg-black/15 p-3 text-left sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-black text-[#f5dc83]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              PLAYERS WHO FOUND THE TRUTH
            </span>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs font-black text-accent">
              {voterNames.length}
            </span>
          </div>
          {voterNames.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {voterNames.map((name, index) => (
                <span
                  key={`${name}-${index}`}
                  className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold text-[#f4e6ae]"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#b9b09a]">
              Nobody selected the real answer this round.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubmittedAnswerCard({
  submission,
}: {
  submission: RevealedSubmission;
}) {
  return (
    <article className="relative mt-4 flex h-full min-h-52 min-w-0 flex-col rounded-[20px] border border-border bg-[#1c1c22]/95 p-4 pt-9 shadow-[0_5px_0_#0d0d10] sm:p-5 sm:pt-9">
      <div className="absolute -top-3 left-4 flex max-w-[calc(100%-6.5rem)] items-center gap-2 rounded-lg border border-border  bg-primary py-1 pl-1 pr-3 shadow-[0_3px_0_#15151b] sm:max-w-[calc(100%-7.5rem)]">
        <span className="shrink-0 overflow-hidden rounded-md bg-tansparent">
          <PlayerAvatar
            name={submission.author.name}
            src={submission.author.avatar}
            size={24}
          />
        </span>
        <span className="truncate text-xs font-bold text-[#17171c] text-xs">
          {submission.author.name}
        </span>
      </div>

      <span
        className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full border-2 border-[#15151b] bg-primary px-2.5 py-1 font-mono text-xs font-black text-[#17171c] shadow-[0_3px_0_#15151b]"
        aria-label={`${submission.voterNames?.length ?? 0} votes`}
      >
        <Vote className="size-3.5" aria-hidden="true" />
        {submission.voterNames?.length ?? 0}
      </span>

      <div className="flex min-h-28 flex-1 items-center justify-center px-4 py-5 text-center">
        <p dir="auto" className="whitespace-normal break-words font-display text-xl font-black leading-7 text-foreground sm:text-2xl">
          {submission.text}
        </p>
      </div>

      <div className="border-t border-white/10 pt-3">
        {submission.voterNames && submission.voterNames.length > 0 ? (
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.1em] text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              CHOSEN BY
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {submission.voterNames.map((name, index) => (
                <span
                  key={`${name}-${index}`}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-[#d7d5da]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs font-semibold text-muted-foreground">
            No votes for this answer
          </p>
        )}
      </div>
    </article>
  );
}
