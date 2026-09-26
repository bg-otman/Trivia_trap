"use client";

import { Check } from "lucide-react";
import type { Player } from "@/types/player";
import { cn } from "@/lib/utils";
import { WaitingPlayers } from "./waiting-players";
import { WaitingMessage } from "./waiting-message";

export interface WaitingArenaProps {
  players: Player[];
  message?: string;
  confirmation?: string;
  detail?: string;
  compact?: boolean;
  animateAll?: boolean;
  className?: string;
}

export function WaitingArena({
  players,
  message = "WAITING FOR OTHER PLAYERS",
  confirmation,
  detail,
  compact = false,
  animateAll = false,
  className,
}: WaitingArenaProps) {
  return (
    <section
      data-waiting-arena
      aria-label="Waiting arena"
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl border-2 border-[#34323c] bg-[#19191f] text-center shadow-[0_5px_0_#0d0d10]",
        compact ? "px-3 py-3" : "px-4 py-5 sm:px-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(91,95,239,0.12),transparent_70%)]"
      />
      {confirmation ? (
        <p className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-meta text-[10px] font-black tracking-[0.1em] text-accent">
          <Check className="size-3" aria-hidden="true" />
          {confirmation}
        </p>
      ) : null}
      <WaitingPlayers
        players={players}
        compact={compact}
        animateAll={animateAll}
      />
      <WaitingMessage message={message} />
      {detail ? (
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </section>
  );
}
