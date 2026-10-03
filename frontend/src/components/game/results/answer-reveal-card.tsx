import { Crown, Sparkles } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import type { RevealedSubmission } from "@/types/results";

interface CorrectAnswerCardProps {
  answer: string;
  voterNames?: string[];
}

export function CorrectAnswerCard({ answer, voterNames = [] }: CorrectAnswerCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/50 bg-[linear-gradient(135deg,rgba(247,201,72,0.18),rgba(247,201,72,0.06))] px-5 py-6 text-center shadow-[0_18px_55px_rgba(247,201,72,0.12)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
          <Crown className="size-5 fill-current" aria-hidden="true" />
        </div>
        <p className="mt-4 font-meta text-[11px] font-black tracking-[0.16em] text-accent">
          THE REAL ANSWER
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-balance font-display text-2xl font-black leading-tight text-white sm:text-3xl">
          {answer}
        </p>
        {voterNames.length > 0 ? (
          <p className="mt-3 text-xs font-bold text-[#d8c678]">
            {voterNames.length} {voterNames.length === 1 ? "PLAYER" : "PLAYERS"} FOUND THE TRUTH · {voterNames.join(", ")}
          </p>
        ) : null}
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
    <article className="flex h-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-[#1c1c22]/95 p-4 shadow-[0_5px_0_#0d0d10] sm:gap-4 sm:p-5">
      <PlayerAvatar
        name={submission.author.name}
        src={submission.author.avatar}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="size-3" aria-hidden="true" />
          <p className="truncate font-meta text-[10px] font-black tracking-[0.12em]">
            {submission.author.name}&apos;S TRAP
          </p>
        </div>
        <p className="mt-1.5 whitespace-normal break-words font-display text-base font-bold leading-6 text-foreground">
          {submission.text}
        </p>
        {submission.voterNames && submission.voterNames.length > 0 ? (
          <p className="mt-1 text-[10px] font-bold text-muted-foreground">
            {submission.voterNames.length} {submission.voterNames.length === 1 ? "VOTE" : "VOTES"} · {submission.voterNames.join(", ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
