"use client";

import { useState } from "react";
import { VotingArena } from "@/components/game/voting/voting-arena";
import { mockQuestions } from "@/mocks/questions";
import type { AnswerOption } from "@/types/question";

interface VotingPhaseProps {
  seconds: number;
}

export function VotingPhase({ seconds }: VotingPhaseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption["id"]>("B");
  const [hasVoted, setHasVoted] = useState(false);

  return (
    <VotingArena
      question={mockQuestions[0]}
      selectedAnswer={selectedAnswer}
      hasVoted={hasVoted}
      onSelectAnswer={setSelectedAnswer}
      onCastVote={() => {
        if (seconds > 0) setHasVoted(true);
      }}
    />
  );
}
