"use client";

import { useState } from "react";
import { VotingArena } from "@/components/game/voting/voting-arena";
import { mockQuestions } from "@/mocks/questions";
import { mockVotingOptions, mockVotingProgress } from "@/mocks/voting";
import type { VotingOption } from "@/types/question";

interface VotingPhaseProps {
  seconds: number;
}

export function VotingPhase({ seconds }: VotingPhaseProps) {
  const [lockedOptionId, setLockedOptionId] = useState<VotingOption["id"] | null>(
    null,
  );

  function lockVote(optionId: VotingOption["id"]) {
    if (seconds <= 0 || lockedOptionId) return;
    setLockedOptionId(optionId);
  }

  return (
    <VotingArena
      question={mockQuestions[0]}
      options={mockVotingOptions}
      lockedOptionId={lockedOptionId}
      votesSubmitted={
        mockVotingProgress.votesSubmitted + (lockedOptionId ? 1 : 0)
      }
      totalVoters={mockVotingProgress.totalVoters}
      votingClosed={seconds <= 0}
      onVote={lockVote}
    />
  );
}
