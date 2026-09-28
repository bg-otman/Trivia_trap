"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Crown, Minus } from "lucide-react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { standingsPacing } from "@/animations/standings-pacing";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(Flip);

export interface LeaderboardPlayer {
  id: string;
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
  onResolved?: () => void;
}

export function Leaderboard({
  players,
  className,
  label,
  currentRound,
  totalRounds,
  variant = "round",
  onResolved,
}: LeaderboardProps) {
  const isFinal = variant === "final";
  const reducedMotion = useReducedMotion();
  const rowsRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const rankedPlayers = useMemo(
    () => [...players].sort(compareFinalRank),
    [players],
  );
  const previousPlayers = useMemo(() => {
    const finalPositions = new Map(
      rankedPlayers.map((player, index) => [
        playerKey(player),
        player.rank ?? index + 1,
      ]),
    );

    return [...rankedPlayers].sort((a, b) => {
      const previousA =
        (finalPositions.get(playerKey(a)) ?? 1) + (a.rankChange ?? 0);
      const previousB =
        (finalPositions.get(playerKey(b)) ?? 1) + (b.rankChange ?? 0);
      return previousA - previousB || compareFinalRank(a, b);
    });
  }, [rankedPlayers]);
  const [displayedPlayers, setDisplayedPlayers] = useState(previousPlayers);
  const [reorderStarted, setReorderStarted] = useState(false);
  const [reorderComplete, setReorderComplete] = useState(false);

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state || reducedMotion || isFinal) return;

    flipStateRef.current = null;
    const animation = Flip.from(state, {
      duration: standingsPacing.reorderDuration,
      ease: "power3.inOut",
      absolute: true,
      stagger: 0,
      scale: false,
      onComplete: () => setReorderComplete(true),
    });

    return () => {
      animation.kill();
    };
  }, [displayedPlayers, isFinal, reducedMotion]);

  useEffect(() => {
    if (isFinal || reducedMotion) {
      const timeout = window.setTimeout(
        () => onResolved?.(),
        reducedMotion ? 180 : 0,
      );
      return () => window.clearTimeout(timeout);
    }

    const reorder = window.setTimeout(() => {
      const rows = rowsRef.current?.querySelectorAll("[data-player-row]");
      if (rows?.length) flipStateRef.current = Flip.getState(rows);
      setReorderStarted(true);
      setDisplayedPlayers(rankedPlayers);
    }, standingsPacing.reorder * 1000);
    const complete = window.setTimeout(
      () => onResolved?.(),
      standingsPacing.resolved * 1000,
    );
    return () => {
      window.clearTimeout(reorder);
      window.clearTimeout(complete);
    };
  }, [isFinal, onResolved, previousPlayers, rankedPlayers, reducedMotion]);
  const remainingRounds =
    currentRound !== undefined && totalRounds !== undefined
      ? Math.max(0, totalRounds - currentRound)
      : undefined;
  const visiblePlayers =
    isFinal || reducedMotion ? rankedPlayers : displayedPlayers;

  return (
    <motion.section
      data-standings
      initial={
        reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0.14 : standingsPacing.container,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "rounded-3xl border border-border bg-[#1c1c22] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:p-5",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-1 pb-4">
        <div>
          <motion.h2
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.12 : 0.4,
              delay: reducedMotion ? 0 : standingsPacing.header,
              ease: "easeOut",
            }}
            className="font-display text-xl font-black text-foreground sm:text-2xl"
          >
            {label ?? (isFinal ? "FINAL STANDINGS" : "CURRENT STANDINGS")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.12 : 0.34,
              delay: reducedMotion ? 0 : standingsPacing.subtitle,
              ease: "easeOut",
            }}
            className="mt-1 text-[10px] font-black tracking-[0.16em] text-accent"
          >
            {isFinal
              ? "GAME COMPLETE"
              : currentRound !== undefined
                ? `ROUND ${currentRound} RESULTS`
                : "ROUND RESULTS"}
          </motion.p>
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
        {!isFinal && <span className="text-right">ROUND POINTS</span>}
        {!isFinal && <span className="text-right">RANK CHANGE</span>}
        <span className="text-right">
          {isFinal ? "FINAL SCORE" : "TOTAL SCORE"}
        </span>
      </div>

      <div ref={rowsRef} className="mt-2 space-y-2.5">
        {visiblePlayers.map((player) => {
          const finalIndex = rankedPlayers.findIndex(
            (candidate) => playerKey(candidate) === playerKey(player),
          );
          const finalRank = player.rank ?? finalIndex + 1;
          const previousRank = finalRank + (player.rankChange ?? 0);
          const displayedRank = reorderStarted ? finalRank : previousRank;
          const isLeader = displayedRank === 1;
          const isFirstPlaceArrival = reorderComplete && finalRank === 1;
          const rankChange = player.rankChange ?? 0;
          const roundPoints = player.roundPoints ?? 0;

          return (
            <motion.div
              key={player.id}
              data-player-row={player.id}
              data-standing-player={playerKey(player)}
              data-standing-rank={displayedRank}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: reducedMotion ? 0.12 : standingsPacing.rowDuration,
                delay: reducedMotion
                  ? 0
                  : standingsPacing.rows +
                    finalIndex * standingsPacing.rowStagger,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-2xl border border-border bg-[#17171c] p-3 md:gap-3",
                isFinal
                  ? "md:grid-cols-[3rem_minmax(0,1fr)_8rem]"
                  : "md:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_7rem]",
                isLeader &&
                  "border-accent/55 bg-accent/[0.07] shadow-[0_8px_22px_rgba(247,201,72,0.07)]",
                player.isYou &&
                  !isLeader &&
                  "border-primary/55 bg-primary/[0.05]",
              )}
            >
              {isFirstPlaceArrival ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-accent/70 shadow-[0_0_24px_rgba(247,201,72,0.2)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.42, ease: "easeInOut" }}
                />
              ) : null}
              {player.isYou && !isFinal ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/70 shadow-[0_0_22px_rgba(255,107,53,0.18)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: 0.56,
                    delay: standingsPacing.highlight,
                  }}
                />
              ) : null}
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl bg-black/20 font-display text-xs font-black text-[#a6a6ae] md:size-9 md:text-sm",
                  isLeader && "bg-accent/15 text-accent",
                )}
                aria-label={`Rank ${displayedRank}`}
              >
                <motion.span
                  animate={
                    isFirstPlaceArrival && !reducedMotion
                      ? { scale: [1, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {String(displayedRank).padStart(2, "0")}
                </motion.span>
              </span>

              <div className="flex min-w-0 items-center gap-2.5">
                <motion.div
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.75 }}
                  animate={{
                    opacity: 1,
                    scale: reducedMotion ? 1 : [0.75, 1.08, 1],
                  }}
                  transition={{
                    duration: reducedMotion ? 0.12 : 0.36,
                    delay: reducedMotion
                      ? 0
                      : standingsPacing.rows +
                        finalIndex * standingsPacing.rowStagger +
                        standingsPacing.avatarOffset,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    animate={
                      isFirstPlaceArrival && !reducedMotion
                        ? { scale: [1, 1.06, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <PlayerAvatar
                      name={player.name}
                      src={player.avatar}
                      size={40}
                      status="default"
                    />
                  </motion.div>
                </motion.div>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p
                      className={cn(
                        "truncate font-display text-sm font-black text-foreground",
                        isLeader && "text-accent",
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
                      <RoundPoints
                        value={roundPoints}
                        reducedMotion={reducedMotion}
                      />
                      <RankChange
                        value={rankChange}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  )}
                </div>
              </div>

              {!isFinal && (
                <div className="hidden justify-end md:flex">
                  <RoundPoints
                    value={roundPoints}
                    reducedMotion={reducedMotion}
                  />
                </div>
              )}
              {!isFinal && (
                <div className="hidden justify-end md:flex">
                  <RankChange
                    value={rankChange}
                    reducedMotion={reducedMotion}
                  />
                </div>
              )}

              <p
                data-total-score
                className={cn(
                  "whitespace-nowrap text-right font-display text-sm font-black text-foreground sm:text-base",
                  isLeader && "text-accent",
                )}
              >
                <AnimatedNumber
                  value={getTotalScore(player)}
                  from={
                    isFinal
                      ? 0
                      : Math.max(0, getTotalScore(player) - roundPoints)
                  }
                  delay={
                    isFinal
                      ? 0.3
                      : standingsPacing.totalScore
                  }
                  duration={isFinal ? 0.8 : standingsPacing.totalScoreDuration}
                  pulse={!isFinal}
                />
                <span className="ml-1 block text-[8px] text-[#a6a6ae] sm:inline sm:text-[9px]">
                  PTS
                </span>
              </p>
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-4 border-t border-white/10 pt-4 text-center font-mono text-[10px] text-[#a6a6ae]">
        {isFinal
          ? `FINAL RANKING · ${rankedPlayers.length} PLAYERS`
          : remainingRounds !== undefined
            ? `${remainingRounds} ${remainingRounds === 1 ? "ROUND" : "ROUNDS"} REMAINING · ROUND ${currentRound} OF ${totalRounds}`
            : `${rankedPlayers.length} PLAYERS RANKED`}
      </footer>
    </motion.section>
  );
}

function RoundPoints({
  value,
  reducedMotion,
}: {
  value: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.span
      data-round-points
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        color: value > 0 ? ["#a6a6ae", "#ff6b35", "#4ade80"] : "#a6a6ae",
      }}
      transition={{
        duration: reducedMotion ? 0.12 : 0.3,
        delay: reducedMotion
          ? 0
          : standingsPacing.roundPoints +
            standingsPacing.roundPointsDuration,
      }}
      className={cn(
        "whitespace-nowrap text-[10px] font-black",
        value > 0 ? "text-[#4ade80]" : "text-[#a6a6ae]",
      )}
    >
      +
      <AnimatedNumber
        value={value}
        delay={standingsPacing.roundPoints}
        duration={standingsPacing.roundPointsDuration}
      />{" "}
      PTS
    </motion.span>
  );
}

function RankChange({
  value,
  reducedMotion,
}: {
  value: number;
  reducedMotion: boolean;
}) {
  const suffix = " RANK";
  const initialY = value > 0 ? 8 : value < 0 ? -8 : 0;
  const content =
    value > 0 ? (
      <>
        <ArrowUp className="size-2.5" aria-hidden="true" />+{value}
        {suffix}
      </>
    ) : value < 0 ? (
      <>
        <ArrowDown className="size-2.5" aria-hidden="true" />
        {value}
        {suffix}
      </>
    ) : (
      <>
        <Minus className="size-2.5" aria-hidden="true" />
        =0{suffix}
      </>
    );

  return (
    <motion.span
      initial={{ opacity: 0, y: reducedMotion ? 0 : initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0.12 : 0.32,
        delay: reducedMotion ? 0 : standingsPacing.rankChange,
        ease: "easeOut",
      }}
      className={cn(
        "flex items-center gap-1 whitespace-nowrap text-[9px] font-bold",
        value > 0
          ? "text-[#4ade80]"
          : value < 0
            ? "text-destructive"
            : "text-[#a6a6ae]",
      )}
    >
      {content}
    </motion.span>
  );
}

function getTotalScore(player: LeaderboardPlayer) {
  return player.finalScore ?? player.totalScore ?? player.points ?? 0;
}

function AnimatedNumber({
  value,
  from = 0,
  delay = 0,
  duration = 0.7,
  pulse = false,
}: {
  value: number;
  from?: number;
  delay?: number;
  duration?: number;
  pulse?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const counter = useRef({ value: reducedMotion ? value : from });
  const [display, setDisplay] = useState(reducedMotion ? value : from);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      counter.current.value = value;
      return;
    }
    counter.current.value = from;
    const tween = gsap
      .timeline({ delay })
      .call(() => {
        setDisplay(from);
        setComplete(false);
      })
      .to(counter.current, {
        value,
        duration,
        ease: "power3.out",
        onUpdate: () => setDisplay(Math.round(counter.current.value)),
        onComplete: () => setComplete(true),
      });
    return () => {
      tween.kill();
    };
  }, [delay, duration, from, reducedMotion, value]);

  return (
    <motion.span
      animate={
        complete && pulse && !reducedMotion
          ? { scale: [1, 1.04, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="inline-block tabular-nums"
    >
      {(reducedMotion ? value : display).toLocaleString()}
    </motion.span>
  );
}

function compareFinalRank(a: LeaderboardPlayer, b: LeaderboardPlayer) {
  if (a.rank !== undefined && b.rank !== undefined) return a.rank - b.rank;
  return getTotalScore(b) - getTotalScore(a);
}

function playerKey(player: LeaderboardPlayer) {
  return player.id;
}
