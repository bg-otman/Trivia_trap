"use client";

import { VotingArena } from "@/components/game/voting/voting-arena";
import { LoadingState } from "@/components/ui/loading-state";
import type { Question, VotingOption } from "@/types/question";
import type { Player } from "@/types/player";
import type { GameLanguage } from "@/types/game";

interface VotingPhaseProps {
  players: Player[];
  question: Question;
  options: VotingOption[];
  selectedVote: VotingOption["id"] | null;
  hasVoted: boolean;
  seconds: number;
  onCastVote: (optionId: VotingOption["id"]) => void;
  language?: GameLanguage;
}

export function VotingPhase({
  players,
  question,
  options,
  selectedVote,
  hasVoted,
  seconds,
  onCastVote,
  language = "en",
}: VotingPhaseProps) {
  if (options.length === 0) {
    return (
      <section className="relative z-10 flex w-full flex-1 items-center justify-center p-6">
        <LoadingState title="PREPARING ANSWERS..." description="Shuffling the anonymous answers." variant="game" className="w-full max-w-3xl min-h-64" />
      </section>
    );
  }

  return (
    <VotingArena
      players={players}
      question={question}
      options={options}
      lockedOptionId={hasVoted ? selectedVote : null}
      votingClosed={seconds <= 0 || hasVoted}
      onVote={onCastVote}
      language={language}
    />
  );
}
