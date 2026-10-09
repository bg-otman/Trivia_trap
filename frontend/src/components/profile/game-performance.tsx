import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GamePerformance({ wins, gamesPlayed, winRate }: { wins: number; gamesPlayed: number; winRate: number }) {
  const losses = Math.max(0, gamesPlayed - wins);

  return (
    <section aria-labelledby="performance-title" className="flex flex-col">
      <h2 id="performance-title" className="mb-3 font-secondary text-base uppercase text-white">Game performance</h2>
      <Card className="flex-1 rounded-[20px] border border-white/[0.07] bg-trap-surface">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm font-extrabold">Season overview</CardTitle>
          <Target className="size-4 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <div className="grid size-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#4ade80 ${winRate}%, #29292f 0)` }}>
              <div className="grid size-[74px] place-items-center rounded-full bg-trap-surface text-center">
                <div><strong className="font-secondary text-xl text-white">{winRate}%</strong><span className="block text-[8px] font-bold uppercase tracking-wider text-[#777782]">Win rate</span></div>
              </div>
            </div>
            <dl className="min-w-0 flex-1 space-y-3 text-xs">
              <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-[#a6a6ae]"><span className="size-2 rounded-full bg-trap-success" /> Wins</dt><dd className="font-black text-white">{wins}</dd></div>
              <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-[#a6a6ae]"><span className="size-2 rounded-full bg-[#4a4a52]" /> Losses</dt><dd className="font-black text-white">{losses}</dd></div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3"><dt className="text-[#a6a6ae]">Games</dt><dd className="font-black text-white">{gamesPlayed}</dd></div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
