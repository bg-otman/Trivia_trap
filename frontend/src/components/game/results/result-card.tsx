import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResultCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-popover p-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.06em] text-[#34d399]">
            ROUND RESULT
          </p>
          <span className="rounded-full bg-[rgba(16,185,129,0.2)] px-2 py-0.5 text-[10px] font-bold text-[#34d399]">
            +250 PTS
          </span>
        </div>
        <h3 className="mt-2 font-display text-base font-bold text-white">
          CORRECT ANSWER!
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Streak bonus applied: 1.5x multiplier
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#0e0e11] p-3 text-xs">
          <span className="text-muted-foreground">Total Score:</span>
          <strong className="font-display text-sm text-white">1,450 PTS</strong>
        </div>
      </div>
      <Button className="mt-4 w-full" size="sm">
        NEXT ROUND <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}
