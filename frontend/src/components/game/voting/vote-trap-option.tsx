import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { cn } from "@/lib/utils";

interface VoteTrapOptionProps {
  name: string;
  voted?: boolean;
  votes?: number;
  className?: string;
}

export function VoteTrapOption({
  name,
  voted,
  votes = 3,
  className,
}: VoteTrapOptionProps) {
  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-between rounded-xl border bg-popover px-3.5 py-3",
        voted ? "border-2 border-[rgba(16,185,129,0.5)]" : "border-border",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <PlayerAvatar
          name={name}
          size={32}
          status={voted ? "ready" : "default"}
        />
        <span className="font-display text-xs font-bold text-white">
          {name}
        </span>
      </div>
      {voted ? (
        <span className="flex items-center gap-1 rounded-lg border border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.2)] px-3 py-1.5 text-xs font-bold text-[#34d399]">
          <Check className="size-3" />
          VOTED ({votes})
        </span>
      ) : (
        <Button
          variant="surface"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs"
        >
          VOTE TRAP
        </Button>
      )}
    </div>
  );
}
