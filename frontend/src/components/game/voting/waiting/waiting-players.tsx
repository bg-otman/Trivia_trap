"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import {
  createWaitingIdle,
  createWaitingReactions,
  waitingPlayerSeed,
} from "@/animations/waiting-animations";
import { waitingEase, waitingPacing } from "@/animations/waiting-pacing";
import type { Player } from "@/types/player";
import { cn } from "@/lib/utils";
import { WaitingMotionContext, useWaitingMotion } from "./waiting-motion";

export function WaitingPlayers({
  players,
  compact = false,
  animateAll = false,
}: {
  players: Player[];
  compact?: boolean;
  animateAll?: boolean;
}) {
  const scope = useRef<HTMLUListElement>(null);
  const { enabled } = useWaitingMotion();
  const presentPlayers = players.filter(
    (player) => player.status !== "OFFLINE",
  );
  const reactionKey = JSON.stringify(
    presentPlayers
      .filter(
        (player) =>
          animateAll ||
          player.status === "SUBMITTED" ||
          player.status === "VOTED",
      )
      .map((player) => player.id),
  );

  useEffect(() => {
    if (!enabled || !scope.current || reactionKey === "[]") return;
    return createWaitingReactions(
      scope.current,
      waitingPlayerSeed(reactionKey),
    );
  }, [enabled, reactionKey]);

  return (
    <WaitingMotionContext.Provider value={enabled}>
      <ul
        ref={scope}
        aria-label="Players in the waiting arena"
        className={cn(
          "relative flex flex-wrap items-end justify-center gap-x-3 gap-y-5 px-2 pt-5",
          compact ? "pb-3" : "pb-6 sm:gap-x-6",
        )}
      >
        <AnimatePresence>
          {presentPlayers.map((player, index) => (
            <WaitingPlayer
              key={player.id}
              player={player}
              index={index}
              compact={compact}
              animateAll={animateAll}
            />
          ))}
        </AnimatePresence>
      </ul>
    </WaitingMotionContext.Provider>
  );
}

function WaitingPlayer({
  player,
  index,
  compact,
  animateAll,
}: {
  player: Player;
  index: number;
  compact: boolean;
  animateAll: boolean;
}) {
  const idle = useRef<HTMLDivElement>(null);
  const { enabled, reducedMotion } = useWaitingMotion();
  const seed = waitingPlayerSeed(player.id);
  const waiting =
    animateAll || player.status === "SUBMITTED" || player.status === "VOTED";

  useEffect(() => {
    if (!enabled || !waiting || !idle.current) return;
    const animation = createWaitingIdle(
      idle.current,
      seed,
      player.isYou ? 1.12 : 1,
    );
    return () => {
      animation.revert();
    };
  }, [enabled, player.isYou, seed, waiting]);

  return (
    <motion.li
      data-waiting-player={player.id}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12, delay: 0 } }}
      transition={{
        duration: reducedMotion ? 0.12 : waitingPacing.playerEntrance,
        delay: reducedMotion
          ? 0
          : Math.min(
              index * waitingPacing.playerStagger,
              waitingPacing.maxPlayerDelay,
            ),
        ease: waitingEase,
      }}
      className={cn(
        "flex flex-col items-center",
        compact ? "w-16" : "w-[72px] sm:w-20",
      )}
    >
      {/* Motion: entrance; GSAP: idle; Anime: inner reaction. No shared transforms. */}
      <div ref={idle}>
        <div data-waiting-reaction={enabled && waiting ? "" : undefined}>
          <PlayerAvatar
            name={player.name}
            src={player.avatar}
            size={compact ? 40 : 56}
            status={
              player.isYou
                ? "targeted"
                : player.role === "HOST"
                  ? "host"
                  : "default"
            }
            animated={false}
          />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="mt-2 h-1 w-8 rounded-full bg-black/35"
      />
      <span
        title={player.name}
        className={cn(
          "mt-2 w-full truncate text-center text-[10px] font-bold",
          player.isYou ? "text-primary" : "text-muted-foreground",
        )}
      >
        {player.name}
        {player.isYou ? " · YOU" : ""}
      </span>
    </motion.li>
  );
}
