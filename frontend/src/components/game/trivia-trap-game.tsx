"use client";

import { useEffect, useState } from "react";
import { mockGame } from "@/mocks/game";
import { GameHud } from "./hud/game-hud";
import { PlayerRoster } from "./players/player-roster";
import { CategoryPhase } from "./phases/category-phase";
import { QuestionPhase } from "./phases/question-phase";
import { BluffPhase } from "./phases/bluff-phase";
import { VotingPhase } from "./phases/voting-phase";
import { ResultsRevealPhase } from "./phases/results-reveal-phase";

export function TriviaTrapGame() {
  const game = mockGame;
  const [seconds, setSeconds] = useState(game.timeRemaining);

  useEffect(() => {
    if (game.phase !== "VOTING" || seconds <= 0) return;

    const interval = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.phase, seconds]);

  function renderPhase() {
    switch (game.phase) {
      case "CATEGORY":
        return (
          <CategoryPhase
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
          />
        );
      case "QUESTION":
        return <QuestionPhase />;
      case "BLUFF":
        return <BluffPhase />;
      case "VOTING":
        return <VotingPhase seconds={seconds} />;
      case "RESULTS_REVEAL":
        return <ResultsRevealPhase />;
      default:
        return (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Phase not implemented yet.</p>
          </div>
        );
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground lg:min-h-[819px]">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[rgba(255,107,53,0.10)] blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-16 -right-32 size-96 rounded-full bg-[rgba(91,95,239,0.10)] blur-[60px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.025),transparent_42%)]" />

      <div className="relative flex min-h-screen flex-col lg:min-h-[819px]">
        <GameHud
          round={game.currentRound}
          totalRounds={game.totalRounds}
          seconds={seconds}
          roomCode={game.roomCode}
        />

        {renderPhase()}

        <PlayerRoster players={game.players} />
      </div>
    </main>
  );
}
