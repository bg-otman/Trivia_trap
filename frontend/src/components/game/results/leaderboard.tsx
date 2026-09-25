"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Crown, Minus } from "lucide-react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { animationPacing, cinematicSpring } from "@/animations/pacing";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface LeaderboardPlayer {
  id?: string;
  rank?: number;
  name: string;
  avatar?: string;
  points?: number;
  roundPoints?: number;
  totalScore?: number;
  finalScore?: number;
  isYou?: boolean;
  rankChange?: number;
}

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  className?: string;
  label?: string;
  currentRound?: number;
  totalRounds?: number;
  variant?: "round" | "final";
}

export function Leaderboard({
  players,
  className,
  label,
  currentRound,
  totalRounds,
  variant = "round",
}: LeaderboardProps) {
  const isFinal = variant === "final";
  const reducedMotion = useReducedMotion();
  const rankedPlayers = [...players].sort((a, b) => {
    if (a.rank !== undefined && b.rank !== undefined) return a.rank - b.rank;
    return getTotalScore(b) - getTotalScore(a);
  });
  const remainingRounds =
    currentRound !== undefined && totalRounds !== undefined
      ? Math.max(0, totalRounds - currentRound)
      : undefined;

  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-[#1c1c22] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:p-5",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-1 pb-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.16em] text-accent">
            {isFinal
              ? "GAME COMPLETE"
              : currentRound !== undefined
                ? `ROUND ${currentRound} RESULTS`
                : "ROUND RESULTS"}
          </p>
          <h2 className="mt-1 font-display text-xl font-black text-[#f8f8f2] sm:text-2xl">
            {label ?? (isFinal ? "FINAL STANDINGS" : "CURRENT STANDINGS")}
          </h2>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Crown className="size-5 fill-current" aria-hidden="true" />
        </div>
      </header>

      <div
        className={cn(
          "mt-4 hidden gap-3 px-3 text-[9px] font-bold tracking-[0.1em] text-[#a6a6ae] md:grid",
          isFinal
            ? "grid-cols-[3rem_minmax(0,1fr)_8rem]"
            : "grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_7rem]",
        )}
      >
        <span>RANK</span>
        <span>PLAYER</span>
        {!isFinal && <span className="text-right">THIS ROUND</span>}
        {!isFinal && <span className="text-right">CHANGE</span>}
        <span className="text-right">{isFinal ? "FINAL SCORE" : "TOTAL"}</span>
      </div>

      <motion.div className="mt-2 space-y-2.5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { delayChildren: reducedMotion ? 0 : 0.18, staggerChildren: reducedMotion ? 0 : 0.1 } } }}>
        {rankedPlayers.map((player, index) => {
          const displayedRank = player.rank ?? index + 1;
          const isLeader = displayedRank === 1;
          const rankChange = player.rankChange ?? 0;
          const roundPoints = player.roundPoints ?? 0;

          return (
            <motion.div
              key={player.id ?? player.name}
              layout
              variants={{ hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={cinematicSpring}
              className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-2xl border border-border bg-[#17171c] p-3 md:gap-3",
                isFinal
                  ? "md:grid-cols-[3rem_minmax(0,1fr)_8rem]"
                  : "md:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_7rem]",
                isLeader &&
                  "border-accent/55 bg-accent/[0.07] shadow-[0_8px_22px_rgba(247,201,72,0.07)]",
                player.isYou && !isLeader && "border-primary/55 bg-primary/[0.05]",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl bg-black/20 font-display text-xs font-black text-[#a6a6ae] md:size-9 md:text-sm",
                  isLeader && "bg-accent/15 text-accent",
                )}
                aria-label={`Rank ${displayedRank}`}
              >
                {String(displayedRank).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 items-center gap-2.5">
                <PlayerAvatar
                  name={player.name}
                  src={player.avatar}
                  size={40}
                  status="default"
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p
                      className={cn(
                        "truncate font-display text-sm font-black text-[#f8f8f2]",
                        isLeader && "text-[#f7c948]",
                      )}
                    >
                      {player.name}
                    </p>
                    {player.isYou && (
                      <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-black tracking-[0.08em] text-primary">
                        YOU
                      </span>
                    )}
                  </div>
                  {!isFinal && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 md:hidden">
                      <RoundPoints value={roundPoints} />
                      <RankChange value={rankChange} />
                    </div>
                  )}
                </div>
              </div>

              {!isFinal && (
                <div className="hidden justify-end md:flex">
                  <RoundPoints value={roundPoints} />
                </div>
              )}
              {!isFinal && (
                <div className="hidden justify-end md:flex">
                  <RankChange value={rankChange} />
                </div>
              )}

              <p
                className={cn(
                  "whitespace-nowrap text-right font-display text-sm font-black text-[#f8f8f2] sm:text-base",
                  isLeader && "text-[#f7c948]",
                )}
              >
                <AnimatedNumber value={getTotalScore(player)} />
                <span className="ml-1 block text-[8px] text-[#a6a6ae] sm:inline sm:text-[9px]">
                  PTS
                </span>
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <footer className="mt-4 border-t border-white/10 pt-4 text-center font-mono text-[10px] text-[#a6a6ae]">
        {isFinal
          ? `FINAL RANKING · ${rankedPlayers.length} PLAYERS`
          : remainingRounds !== undefined
            ? `${remainingRounds} ${remainingRounds === 1 ? "ROUND" : "ROUNDS"} REMAINING · ROUND ${currentRound} OF ${totalRounds}`
            : `${rankedPlayers.length} PLAYERS RANKED`}
      </footer>
    </section>
  );
}

function RoundPoints({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap text-[10px] font-black",
        value > 0 ? "text-[#4ade80]" : "text-[#a6a6ae]",
      )}
    >
      +{value.toLocaleString()} PTS
    </span>
  );
}

function RankChange({ value }: { value: number }) {
  const suffix = " RANK";

  if (value > 0) {
    return (
      <span className="flex items-center gap-1 whitespace-nowrap text-[9px] font-bold text-[#4ade80]">
        <ArrowUp className="size-2.5" aria-hidden="true" />+{value}{suffix}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="flex items-center gap-1 whitespace-nowrap text-[9px] font-bold text-destructive">
        <ArrowDown className="size-2.5" aria-hidden="true" />{value}{suffix}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 whitespace-nowrap text-[9px] font-bold text-[#a6a6ae]">
      <Minus className="size-2.5" aria-hidden="true" />=0{suffix}
    </span>
  );
}

function getTotalScore(player: LeaderboardPlayer) {
  return player.finalScore ?? player.totalScore ?? player.points ?? 0;
}

function AnimatedNumber({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();
  const counter = useRef({ value: reducedMotion ? value : 0 });
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      counter.current.value = value;
      return;
    }
    const tween = gsap.to(counter.current, {
      value,
      duration: animationPacing.resultsCount,
      ease: "power3.out",
      onUpdate: () => setDisplay(Math.round(counter.current.value)),
    });
    return () => { tween.kill(); };
  }, [reducedMotion, value]);

  return <>{(reducedMotion ? value : display).toLocaleString()}</>;
}
