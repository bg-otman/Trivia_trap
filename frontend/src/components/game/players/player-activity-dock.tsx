"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Vote } from "lucide-react";
import {
  animate as animateMotion,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { PlayerAvatar } from "./player-avatar";
import { animateSuccessIcon } from "@/animations/micro-interactions";
import {
  createWaitingIdle,
  waitingPlayerSeed,
} from "@/animations/waiting-animations";
import { useWaitingMotion } from "@/components/game/voting/waiting/waiting-motion";
import type { Player } from "@/types/player";
import { cn } from "@/lib/utils";

export type PlayerScores = Record<Player["id"], number>;

export function PlayerActivityDock({
  players,
  scores,
}: {
  players: Player[];
  scores: PlayerScores;
}) {
  const visiblePlayers = players.filter(
    (player) => player.status !== "OFFLINE",
  );
  const avatarSize = visiblePlayers.length > 8 ? 32 : 40;

  return (
    <footer className="relative z-10 mt-auto px-3 pb-3 sm:px-6 sm:pb-4 lg:px-8">
      <section
        aria-label="Player activity"
        className="mx-auto w-full max-w-[900px] rounded-2xl border border-white/[0.08] bg-[#17171c]/90 px-2 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-3"
      >
        <ul
          className="grid items-end gap-1 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.max(visiblePlayers.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {visiblePlayers.map((player) => (
            <PlayerActivity
              key={player.id}
              player={player}
              score={scores[player.id] ?? 0}
              avatarSize={avatarSize}
            />
          ))}
        </ul>
      </section>
    </footer>
  );
}

function PlayerActivity({
  player,
  score,
  avatarSize,
}: {
  player: Player;
  score: number;
  avatarSize: 32 | 40;
}) {
  const finished = player.status === "SUBMITTED" || player.status === "VOTED";
  const [showAction, setShowAction] = useState(false);
  const previousStatus = useRef(player.status);
  const idleLayer = useRef<HTMLDivElement>(null);
  const actionIcon = useRef<HTMLSpanElement>(null);
  const { enabled, reducedMotion } = useWaitingMotion();
  const waiting = finished && !showAction;

  useEffect(() => {
    const newlyFinished = finished && previousStatus.current !== player.status;
    previousStatus.current = player.status;
    if (!newlyFinished) {
      setShowAction(false);
      return;
    }

    setShowAction(true);
    const timeout = window.setTimeout(
      () => setShowAction(false),
      reducedMotion ? 180 : 620,
    );
    return () => window.clearTimeout(timeout);
  }, [finished, player.status, reducedMotion]);

  useEffect(() => {
    if (!showAction) return;
    const animation = animateSuccessIcon(actionIcon.current, reducedMotion);
    return () => {
      animation?.cancel();
    };
  }, [reducedMotion, showAction]);

  useEffect(() => {
    if (!enabled || !waiting || !idleLayer.current) return;
    const animation = createWaitingIdle(
      idleLayer.current,
      waitingPlayerSeed(player.id),
      player.isYou ? 1.12 : 1,
    );
    return () => {
      animation.revert();
    };
  }, [enabled, player.id, player.isYou, waiting]);

  return (
    <motion.li
      layout
      data-player-activity={player.id}
      data-waiting={waiting || undefined}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.25, ease: "easeOut" }}
      className={cn(
        "relative flex min-w-0 flex-col items-center rounded-xl px-0.5 py-1.5",
        player.isYou && "bg-primary/[0.07] ring-1 ring-primary/20",
      )}
    >
      <div ref={idleLayer} className="relative">
        <PlayerAvatar
          name={player.name}
          src={player.avatar}
          size={player.isYou && avatarSize === 40 ? 48 : avatarSize}
          status={player.isYou ? "targeted" : "default"}
          animated={false}
        />
        {showAction ? (
          <span
            ref={actionIcon}
            role="img"
            aria-label={
              player.status === "VOTED" ? "Vote recorded" : "Answer submitted"
            }
            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-[#17171c] bg-[#34d399] text-[#07130e] shadow-md"
          >
            {player.status === "VOTED" ? (
              <Vote className="size-2.5" aria-hidden="true" />
            ) : (
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            )}
          </span>
        ) : null}
      </div>
      <AnimatedScore value={score} reducedMotion={reducedMotion} />
    </motion.li>
  );
}

function AnimatedScore({
  value,
  reducedMotion,
}: {
  value: number;
  reducedMotion: boolean;
}) {
  const score = useMotionValue(value);
  const rounded = useTransform(score, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animateMotion(score, value, {
      duration: reducedMotion ? 0 : 0.38,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [reducedMotion, score, value]);

  return (
    <span className="mt-1 font-mono text-[11px] font-black tabular-nums text-[#e4e1e6] sm:text-xs">
      <span className="sr-only">{value} points</span>
      <motion.span aria-hidden="true">{rounded}</motion.span>
    </span>
  );
}
