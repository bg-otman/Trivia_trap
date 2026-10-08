import { Crown, Target } from "lucide-react";
import { PlayerAvatar, type PlayerAvatarStatus } from "./player-avatar";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/player";

export type PlayerCardState = "waiting" | "ready" | "targeted" | "winner";

interface PlayerCardProps {
  name: Player["name"];
  points: number;
  state?: PlayerCardState;
  className?: string;
}

const stateStyles: Record<PlayerCardState, string> = {
  waiting: "border-[#2a2a35]",
  ready: "border-[rgba(16,185,129,0.4)]",
  targeted:
    "border-2 border-primary shadow-[0_10px_20px_rgba(255,107,53,0.08)]",
  winner:
    "border-2 border-accent shadow-[0_10px_20px_rgba(247,201,72,0.08)]",
};

export function PlayerCard({
  name,
  points,
  state = "waiting",
  className,
}: PlayerCardProps) {
  const avatarStatus: PlayerAvatarStatus =
    state === "ready"
      ? "ready"
      : state === "targeted"
        ? "targeted"
        : state === "winner"
          ? "host"
          : "default";
  return (
    <div
      className={cn(
        "flex min-h-[82px] items-center justify-between rounded-2xl border bg-[#1c1c22] p-4",
        stateStyles[state],
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar name={name} size={48} status={avatarStatus} />
        <div>
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "font-display text-sm font-bold text-white",
                state === "targeted" && "text-[#ffb59d]",
                state === "winner" && "text-accent",
              )}
            >
              {name}
            </p>
            {state === "targeted" ? (
              <Target className="size-3 text-primary" />
            ) : null}
            {state === "winner" ? (
              <Crown className="size-3 text-accent" fill="currentColor" />
            ) : null}
          </div>
          <p
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              state === "ready" && "font-bold text-[#34d399]",
              state === "winner" && "font-bold text-accent",
            )}
          >
            {points.toLocaleString()} PTS
          </p>
        </div>
      </div>
      {state === "waiting" ? (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
          WAITING
        </span>
      ) : null}
      {state === "ready" ? (
        <StatusBadge status="ready" className="px-2.5 py-1 text-[11px]">
          READY
        </StatusBadge>
      ) : null}
      {state === "targeted" ? (
        <StatusBadge status="you" className="px-2.5 py-1 text-[11px]">
          TARGETED
        </StatusBadge>
      ) : null}
      {state === "winner" ? (
        <StatusBadge status="host" className="px-2.5 py-1 text-[11px]">
          #1 HOST
        </StatusBadge>
      ) : null}
    </div>
  );
}
