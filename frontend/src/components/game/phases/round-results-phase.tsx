"use client";

import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Leaderboard } from "@/components/game/results/leaderboard";
import { Button } from "@/components/ui/button";
import type { RoundResults } from "@/types/results";
import type { Player } from "@/types/player";
import { WaitingArena } from "@/components/game/voting/waiting/waiting-arena";

interface RoundResultsPhaseProps {
  players: Player[];
  results: RoundResults;
  currentRound: number;
  totalRounds: number;
  isHost: boolean;
  onContinue: () => void;
}

export function RoundResultsPhase({
  players,
  results,
  currentRound,
  totalRounds,
  isHost,
  onContinue,
}: RoundResultsPhaseProps) {
  const [resolved, setResolved] = useState(false);
  const handleResolved = useCallback(() => setResolved(true), []);

  return (
    <section className="relative z-10 mb-10 flex w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="w-full max-w-[980px]">
        <Leaderboard
          players={results.players}
          currentRound={currentRound}
          totalRounds={totalRounds}
          onResolved={handleResolved}
        />

        <AnimatePresence>
          {resolved ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="mt-5"
            >
              {isHost ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={onContinue}
                  className="w-full"
                >
                  {currentRound < totalRounds ? "NEXT ROUND" : "FINAL RESULTS"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <WaitingArena
                  players={players}
                  compact
                  animateAll
                  message={
                    currentRound < totalRounds
                      ? "WAITING FOR THE NEXT ROUND"
                      : "WAITING FOR THE HOST"
                  }
                  detail="Your host will continue the game shortly."
                />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
