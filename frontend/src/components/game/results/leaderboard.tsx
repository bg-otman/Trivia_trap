import { Crown } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { cn } from "@/lib/utils";

export interface LeaderboardPlayer {
  name: string;
  points: number;
}

export function Leaderboard({
  players,
  className,
}: {
  players: LeaderboardPlayer[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold tracking-[0.06em] text-muted-foreground">
          LIVE ROSTER (TOP {players.length})
        </p>
        <Crown className="size-3.5 text-accent" />
      </div>
      <div className="space-y-2.5">
        {players.map((player, index) => (
          <div
            key={player.name}
            className={cn(
              "flex items-center justify-between rounded-xl border border-border bg-popover p-2.5",
              index === 0 && "border-[rgba(247,201,72,0.3)]",
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "w-4 text-center font-display text-xs font-bold text-muted-foreground",
                  index === 0 && "text-accent",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <PlayerAvatar
                name={player.name}
                size={32}
                status={
                  index === 0 ? "host" : index === 1 ? "ready" : "default"
                }
              />
              <span className="truncate text-xs font-bold text-white">
                {player.name}
              </span>
            </div>
            <span
              className={cn(
                "font-display text-xs font-bold text-muted-foreground",
                index === 0 && "text-accent",
                index === 1 && "text-[#34d399]",
                index === 2 && "text-ring",
              )}
            >
              {player.points.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-white/10 pt-3 text-center font-mono text-[11px] text-muted-foreground">
        Synced with Room Server #8821
      </p>
    </div>
  );
}
