"use client";

import { useEffect, useState } from "react";
import { GameHud } from "@/components/game/hud/game-hud";
import { PlayerRoster } from "@/components/game/players/player-roster";
import { VotingArena } from "@/components/game/voting/voting-arena";
import type { AnswerOption, Question } from "@/types/question";

const question: Question = {
  id: "ancient-wonders",
  category: "HISTORY & ARCHAEOLOGY",
  text: "Which ancient wonder was located in the city of Babylon and celebrated for its tiered stone terraces?",
  type: "TEXT",
  answers: [
    { id: "A", label: "Hanging Gardens", text: "Hanging Gardens" },
    { id: "B", label: "The Sunken Obelisk", text: "The Sunken Obelisk" },
    { id: "C", label: "Golden Temple", text: "Golden Temple" },
    { id: "D", label: "Colossus of Rhodes", text: "Colossus of Rhodes" },
  ],
};

export function TriviaTrapGame() {
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption["id"]>("B");
  const [hasVoted, setHasVoted] = useState(false);
  const [seconds, setSeconds] = useState(18);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pinCopied, setPinCopied] = useState(false);

  useEffect(() => {
    if (hasVoted || seconds <= 0) return;

    const interval = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasVoted, seconds]);

  async function copyRoomPin() {
    try {
      await navigator.clipboard.writeText("X7K9P2");
      setPinCopied(true);
      window.setTimeout(() => setPinCopied(false), 1400);
    } catch {
      setPinCopied(false);
    }
  }

  function castVote() {
    if (seconds <= 0) return;
    setHasVoted(true);
  }

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-background lg:min-h-[819px]"
      data-node-id="1:1804"
    >
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[rgba(255,107,53,0.10)] blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-16 -right-32 size-96 rounded-full bg-[rgba(91,95,239,0.10)] blur-[60px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.025),transparent_42%)]" />

      <div className="relative flex min-h-screen flex-col lg:min-h-[819px]">
        <GameHud />

        <VotingArena
          question={question}
          selectedAnswer={selectedAnswer}
          hasVoted={hasVoted}
          onSelectAnswer={setSelectedAnswer}
          onCastVote={castVote}
        />

        <PlayerRoster />
      </div>
    </div>
  );
}
