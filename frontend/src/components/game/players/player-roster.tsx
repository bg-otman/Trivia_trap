import {
  Check,
  Crown,
  LoaderCircle,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player, PlayerStatus } from "@/types/player";

function StatusIcon({ status }: { status: PlayerStatus }) {
  if (status === "VOTED") return <LockKeyhole className="size-2.5" />;
  if (status === "SUBMITTED") return <Check className="size-3" />;
  return (
    <LoaderCircle className="size-3 animate-spin [animation-duration:2s]" />
  );
}

export function PlayerRoster({ players }: { players: Player[] }) {
  const submittedCount = players.filter(
    (player) => player.status === "SUBMITTED" || player.status === "VOTED",
  ).length;
  const thinkingCount = players.filter((player) => player.status === "THINKING").length;

  return (
    <footer
      className="relative z-10 mt-auto px-4 pb-5 sm:px-6 lg:px-8"
      data-node-id="2:4264"
    >
      <section className="mx-auto w-full max-w-[1216px] rounded-2xl border border-border bg-card px-5 py-3 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_8px_10px_-6px_rgba(0,0,0,0.10)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-[#e4e1e6]">
            <UsersRound className="h-3.5 w-4" aria-hidden="true" />
            <span className="font-meta text-xs font-bold tracking-[0.05em]">
              ROOM ROSTER STATUS
            </span>
          </div>
          <div className="flex items-center gap-2 font-meta text-[11px] font-semibold tracking-[0.05em] text-muted-foreground">
            <span className="size-2 rounded-full bg-[#efc141]" />
            <span>{submittedCount} / {players.length} players submitted • {thinkingCount} players thinking...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {players.map((player) => {
            const active = player.isYou;
            return (
              <div
                key={player.id}
                className={cn(
                  "relative flex min-w-0 items-center gap-2.5 rounded-xl bg-popover p-3",
                  active
                    ? "border-2 border-primary"
                    : "border border-border",
                )}
              >
                {player.role === "HOST" && (
                  <Crown
                    className="absolute -right-1 -top-2 size-4 fill-[#efc141] text-[#efc141] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
                    aria-label="Host"
                  />
                )}

                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-bold text-[#e4e1e6]",
                    active
                      ? "border-2 border-primary"
                      : "border border-border",
                  )}
                  aria-hidden="true"
                >
                  {player.name.slice(0, 2)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate font-display text-xs font-bold leading-4 text-[#e4e1e6]">
                      {player.name}
                    </span>
                    {player.isYou && (
                      <span className="font-meta text-[11px] font-bold tracking-[0.05em] text-primary">
                        [YOU]
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 flex items-center gap-1 font-meta text-[10px] font-bold leading-[15px]",
                      player.status === "VOTED" && "text-primary",
                      player.status === "SUBMITTED" && "text-[#efc141]",
                      player.status === "THINKING" && "text-muted-foreground",
                    )}
                  >
                    <StatusIcon status={player.status} />
                    <span>{player.status === "VOTED" ? "LOCKED" : player.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </footer>
  );
}
