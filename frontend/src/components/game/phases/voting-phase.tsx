"use client";

import { VotingArena } from "@/components/game/voting/voting-arena";
import type { Question, VotingOption } from "@/types/question";

interface VotingPhaseProps {
  question: Question;
  options: VotingOption[];
  selectedVote: VotingOption["id"] | null;
  hasVoted: boolean;
  seconds: number;
  onCastVote: (optionId: VotingOption["id"]) => void;
}

export function VotingPhase({
  question,
  options,
  selectedVote,
  hasVoted,
  seconds,
  onCastVote,
}: VotingPhaseProps) {
  return (
    <VotingArena
      question={question}
      options={options}
      lockedOptionId={hasVoted ? selectedVote : null}
      votingClosed={seconds <= 0 || hasVoted}
      onVote={onCastVote}
    />
  );
}
