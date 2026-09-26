"use client";

import { VotingArena } from "@/components/game/voting/voting-arena";
import type { Question, VotingOption } from "@/types/question";
import type { Player } from "@/types/player";

interface VotingPhaseProps {
  players: Player[];
  question: Question;
  options: VotingOption[];
  selectedVote: VotingOption["id"] | null;
  hasVoted: boolean;
  seconds: number;
  onCastVote: (optionId: VotingOption["id"]) => void;
}

export function VotingPhase({
  players,
  question,
  options,
  selectedVote,
  hasVoted,
  seconds,
  onCastVote,
}: VotingPhaseProps) {
  return (
    <VotingArena
      players={players}
      question={question}
      options={options}
      lockedOptionId={hasVoted ? selectedVote : null}
      votingClosed={seconds <= 0 || hasVoted}
      onVote={onCastVote}
    />
  );
}
