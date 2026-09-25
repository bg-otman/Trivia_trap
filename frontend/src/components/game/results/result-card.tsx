import { Sparkles } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { StatusBadge } from "@/components/game/players/status-badge";
import { cn } from "@/lib/utils";
import type { RoundResultPlayer } from "@/types/results";

interface ResultCardProps {
  currentRound?: number;
  players?: RoundResultPlayer[];
  className?: string;
}

const previewPlayers: RoundResultPlayer[] = [
  {
    id: "preview",
    name: "PLAYER",
    isYou: true,
    isHost: false,
    rankChange: 0,
    roundPoints: 3,
    totalScore: 3,
  },
];

export function ResultCard({
  currentRound = 2,
  players = previewPlayers,
  className,
}: ResultCardProps) {
  const highestGain = Math.max(0, ...players.map((player) => player.roundPoints));
  const topGainer = players.find((player) => player.roundPoints === highestGain);

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border bg-[#1c1c22] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:p-5",
        className,
      )}
    >
      <header className="mb-4 border-b border-white/10 pb-4">
        <p className="font-display text-lg font-black text-[#f8f8f2]">
          ROUND {currentRound} SCORE
        </p>
        <p className="mt-1 text-[10px] font-bold tracking-[0.14em] text-[#a6a6ae]">
          EARNED THIS ROUND
        </p>
      </header>

      <div className="flex-1 space-y-2.5">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-[#17171c] p-3",
              player.isYou && "border-primary/60 bg-primary/[0.06]",
            )}
          >
            <PlayerAvatar
              name={player.name}
              src={player.avatar}
              size={40}
              status="default"
            />

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <p className="truncate font-display text-sm font-black text-[#f8f8f2]">
                  {player.name}
                </p>
                {player.isYou && (
                  <StatusBadge status="you" className="h-5 px-1.5 text-[8px]">
                    YOU
                  </StatusBadge>
                )}
                {player.isHost && (
                  <StatusBadge status="host" className="h-5 px-1.5 text-[8px]">
                    HOST
                  </StatusBadge>
                )}
              </div>
            </div>

            <p
              className={cn(
                "shrink-0 font-display text-base font-black",
                player.roundPoints > 0 ? "text-[#4ade80]" : "text-[#a6a6ae]",
              )}
            >
              {player.roundPoints > 0 ? "+" : ""}
              {player.roundPoints.toLocaleString()}
              <span className="ml-1 text-[9px]">PTS</span>
            </p>
          </div>
        ))}
      </div>

      {topGainer && (
        <footer className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-[10px] font-bold tracking-[0.08em]">
          <span className="flex items-center gap-1.5 text-[#f7c948]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            TOP ROUND GAIN
          </span>
          <span className="truncate text-[#a6a6ae]">
            {topGainer.name} · +{topGainer.roundPoints.toLocaleString()} PTS
          </span>
        </footer>
      )}
    </section>
  );
}
