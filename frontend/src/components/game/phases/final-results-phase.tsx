"use client";

import { Crown, DoorOpen, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Leaderboard } from "@/components/game/results/leaderboard";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { StatusBadge } from "@/components/game/players/status-badge";
import { Button } from "@/components/ui/button";
import { useTheatreCinematic } from "@/hooks/use-theatre-cinematic";
import { animationPacing, cinematicSpring } from "@/animations/pacing";
import type { FinalResults } from "@/types/results";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { WaitingArena } from "@/components/game/voting/waiting/waiting-arena";
import type { Player } from "@/types/player";

interface FinalResultsPhaseProps {
  players: Player[];
  results: FinalResults;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export function FinalResultsPhase({
  players,
  results,
  onPlayAgain,
  onLeaveRoom,
}: FinalResultsPhaseProps) {
  const reducedMotion = useReducedMotion();
  const cinematicProgress = useTheatreCinematic("Final Results", animationPacing.finalResults, !reducedMotion);
  const trophyVisible = Boolean(reducedMotion) || cinematicProgress >= 0.1;
  const winnerVisible = Boolean(reducedMotion) || cinematicProgress >= 0.28;
  const scoreVisible = Boolean(reducedMotion) || cinematicProgress >= 0.42;
  const standingsVisible = Boolean(reducedMotion) || cinematicProgress >= 0.55;
  const actionsVisible = Boolean(reducedMotion) || cinematicProgress >= 0.8;
  const winner =
    results.standings.find((player) => player.rank === 1) ??
    results.standings[0];

  if (!winner) {
    return (
      <section className="relative z-10 flex w-full flex-1 items-center justify-center p-6 text-muted-foreground">
        <WaitingArena players={players} message="WAITING FOR FINAL STANDINGS" className="max-w-3xl" />
      </section>
    );
  }

  return (
    <section className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: reducedMotion ? 0.08 : Math.min(0.24, cinematicProgress * 0.24) }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[920px] overflow-hidden rounded-3xl border border-border bg-[#1c1c22] shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <div className="relative overflow-hidden border-b border-accent/25 bg-accent/[0.07] px-5 py-8 text-center sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <motion.div
              className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-accent/45 bg-accent/15 text-accent shadow-[0_0_36px_rgba(247,201,72,0.16)]"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -28, scale: 0.6, rotate: -8 }}
              animate={trophyVisible ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : { opacity: 0, y: -28, scale: 0.6, rotate: -8 }}
              transition={cinematicSpring}
            >
              <Trophy className="size-8 fill-current" aria-hidden="true" />
            </motion.div>
            <p className="mt-4 font-meta text-[11px] font-black tracking-[0.2em] text-accent">
              GAME OVER
            </p>
            <div className="mt-4 flex flex-col items-center">
              <PlayerAvatar
                name={winner.name}
                src={winner.avatar}
                size={64}
                status="host"
              />
              <motion.div initial={false} animate={{ opacity: winnerVisible ? 1 : 0, y: winnerVisible ? 0 : 8 }} transition={{ duration: 0.38, ease: "easeOut" }} className="mt-3 flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-[#f7c948] sm:text-3xl">
                  {winner.name}
                </h1>
                {winner.isYou && (
                  <StatusBadge status="you" className="text-[9px]">
                    YOU
                  </StatusBadge>
                )}
              </motion.div>
              <motion.div initial={false} animate={{ opacity: scoreVisible ? 1 : 0, scale: scoreVisible ? 1 : 0.9 }} transition={{ duration: 0.38, ease: "easeOut" }} className="mt-2 flex items-center gap-2 text-accent">
                <Crown className="size-4 fill-current" aria-hidden="true" />
                <p className="font-display text-lg font-black">
                  {winner.finalScore.toLocaleString()} PTS
                </p>
              </motion.div>
              <p className="mt-1 text-xs font-bold tracking-[0.1em] text-[#a6a6ae]">
                TRIVIA TRAP CHAMPION
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {standingsVisible ? (
            <Leaderboard
              players={results.standings}
              variant="final"
              className="border-0 bg-transparent p-0 shadow-none"
            />
          ) : <div className="min-h-72" aria-hidden="true" />}

          <motion.div initial={false} animate={{ opacity: actionsVisible ? 1 : 0, y: actionsVisible ? 0 : reducedMotion ? 0 : 14 }} transition={{ duration: 0.38, ease: "easeOut" }} className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button type="button" size="lg" onClick={onPlayAgain}>
              <RotateCcw className="size-4" aria-hidden="true" />
              PLAY AGAIN
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onLeaveRoom}
            >
              <DoorOpen className="size-4" aria-hidden="true" />
              LEAVE ROOM
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
