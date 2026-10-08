import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profileRecentGames } from "@/mocks/profile";
import { cn } from "@/lib/utils";

export function ProfileRecentGames() {
  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
        <CardTitle className="font-secondary text-lg uppercase">Recent games</CardTitle>
        <Button type="button" variant="ghost" size="sm" className="text-[9px] text-[#a6a6ae]">View all games <ArrowUpRight className="size-3.5" /></Button>
      </CardHeader>
      <CardContent className="divide-y divide-white/[0.055] px-0">
        {profileRecentGames.map((game) => (
          <div key={game.title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_90px_95px]">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white">{game.title}</p>
              <p className="mt-1 text-[10px] text-[#777782]">{game.placement} · {game.playedAt}</p>
            </div>
            <Badge className={cn("hidden w-fit border-0 text-[8px] font-black sm:inline-flex", game.result === "WIN" ? "bg-trap-success/10 text-trap-success" : "bg-trap-danger/10 text-trap-danger")}>{game.result}</Badge>
            <div className="text-right">
              <Badge className={cn("mb-1 border-0 text-[8px] font-black sm:hidden", game.result === "WIN" ? "bg-trap-success/10 text-trap-success" : "bg-trap-danger/10 text-trap-danger")}>{game.result}</Badge>
              <p className="text-xs font-black text-accent">+{game.points} pts</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
