"use client";

import { useEffect, useState } from "react";
import { mockGame } from "@/mocks/game";
import { mockQuestions } from "@/mocks/questions";
import { GameHud } from "./hud/game-hud";
import { PlayerRoster } from "./players/player-roster";
import { CategoryPhase } from "./phases/category-phase";
import { TrapPhase } from "./phases/trap-phase";
import { VotingPhase } from "./phases/voting-phase";
import { ResultsRevealPhase } from "./phases/results-reveal-phase";
import type { GamePhase } from "@/types/game";

const timedPhases: GamePhase[] = ["CATEGORY", "TRAP", "VOTING"];

export function TriviaTrapGame() {
  const game = mockGame;
  const [seconds, setSeconds] = useState(game.timeRemaining);

  useEffect(() => {
    if (!timedPhases.includes(game.phase) || seconds <= 0) return;

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
      case "TRAP":
        return (
          <TrapPhase
            question={mockQuestions[0]}
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
          />
        );
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
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-[-12rem] top-[-12rem] size-[min(38rem,60vw)] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-14rem] right-[-12rem] size-[min(42rem,65vw)] rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-white/[0.025] to-transparent" />
      </div>

      <div className="relative flex min-h-dvh flex-col">
        <GameHud
          round={game.currentRound}
          totalRounds={game.totalRounds}
          seconds={seconds}
          roomCode={game.roomCode}
          phase={game.phase}
        />

        <div className="flex w-full flex-1 flex-col justify-center">
          {renderPhase()}
        </div>

        <PlayerRoster players={game.players} />
      </div>
    </main>
  );
}
