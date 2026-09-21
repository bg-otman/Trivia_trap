import {
  Check,
  Crown,
  LoaderCircle,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlayerStatus = "locked" | "submitted" | "thinking";

interface Player {
  name: string;
  initials: string;
  status: PlayerStatus;
  isYou?: boolean;
  isHost?: boolean;
}

const players: Player[] = [
  {
    name: "MEHDI",
    initials: "ME",
    status: "locked",
    isYou: true,
    isHost: true,
  },
  { name: "ALEX", initials: "AL", status: "submitted" },
  { name: "SARAH", initials: "SA", status: "submitted" },
  { name: "YASSINE", initials: "YA", status: "submitted" },
  { name: "ADAM", initials: "AD", status: "thinking" },
  { name: "SAM", initials: "SM", status: "thinking" },
];

function StatusIcon({ status }: { status: PlayerStatus }) {
  if (status === "locked") return <LockKeyhole className="size-2.5" />;
  if (status === "submitted") return <Check className="size-3" />;
  return (
    <LoaderCircle className="size-3 animate-spin [animation-duration:2s]" />
  );
}

export function PlayerRoster() {
  return (
    <footer
      className="relative z-10 px-4 pb-5 sm:px-6 lg:px-8"
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
            <span>4 / 6 players submitted • 2 players thinking...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {players.map((player) => {
            const active = player.isYou;
            return (
              <div
                key={player.name}
                className={cn(
                  "relative flex min-w-0 items-center gap-2.5 rounded-xl bg-popover p-3",
                  active
                    ? "border-2 border-primary"
                    : "border border-border",
                )}
              >
                {player.isHost && (
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
                  {player.initials}
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
                      player.status === "locked" && "text-primary",
                      player.status === "submitted" && "text-[#efc141]",
                      player.status === "thinking" && "text-muted-foreground",
                    )}
                  >
                    <StatusIcon status={player.status} />
                    <span>{player.status.toUpperCase()}</span>
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
