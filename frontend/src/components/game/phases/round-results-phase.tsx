import { ArrowRight, Clock3 } from "lucide-react";
import { Leaderboard } from "@/components/game/results/leaderboard";
import { Button } from "@/components/ui/button";
import { PhaseContent } from "@/components/game/system/phase-transition";
import type { RoundResults } from "@/types/results";

interface RoundResultsPhaseProps {
  results: RoundResults;
  currentRound: number;
  totalRounds: number;
  isHost: boolean;
  onContinue: () => void;
}

export function RoundResultsPhase({
  results,
  currentRound,
  totalRounds,
  isHost,
  onContinue,
}: RoundResultsPhaseProps) {
  return (
    <section className="relative z-10 mb-10 flex w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PhaseContent className="w-full max-w-[980px]">
        <Leaderboard
          players={results.players}
          currentRound={currentRound}
          totalRounds={totalRounds}
        />

        <PhaseContent delay={0.72} className="mt-5">
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
            <Button
              type="button"
              variant="surface"
              size="lg"
              disabled
              className="w-full opacity-100"
            >
              <Clock3 className="size-4" aria-hidden="true" />
              WAITING FOR HOST
            </Button>
          )}
        </PhaseContent>
      </PhaseContent>
    </section>
  );
}
