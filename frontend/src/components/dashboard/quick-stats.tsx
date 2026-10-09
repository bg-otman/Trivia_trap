import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserStatistics } from "@/types/userData";
import { Crown, Gamepad2, Medal, Target } from "lucide-react";

const tones = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-[#5b5fef]/12 text-[#9295ff]",
  accent: "bg-accent/10 text-accent",
  success: "bg-trap-success/10 text-trap-success",
};

export function QuickStats({ stats }: { stats: UserStatistics }) {
  const winRate = stats.total_games === 0 ? 0 : Math.round((stats.total_wins / stats.total_games) * 100);
  const dashboardStats = [
    { label: "Games played", value: stats.total_games.toLocaleString(), detail: "All completed games", icon: Gamepad2, tone: "secondary" as const },
    { label: "Wins", value: stats.total_wins.toLocaleString(), detail: "First-place finishes", icon: Crown, tone: "accent" as const },
    { label: "Win rate", value: `${winRate}%`, detail: "Across completed games", icon: Target, tone: "success" as const },
    { label: "Total score", value: stats.total_points.toLocaleString(), detail: `Best score: ${stats.high_score.toLocaleString()}`, icon: Medal, tone: "primary" as const },
  ];
  return (
    <section aria-label="Quick statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <Card key={stat.label} className="rounded-2xl border border-white/[0.07] bg-trap-surface py-0 shadow-[0_14px_34px_rgba(0,0,0,0.14)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#85858f] sm:text-[10px]">{stat.label}</p>
              <span className={cn("grid size-8 place-items-center rounded-xl", tones[stat.tone])}>
                <stat.icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 font-secondary text-2xl tracking-[-0.03em] text-white sm:text-3xl">{stat.value}</p>
            <p className="mt-1 truncate text-[10px] font-semibold text-[#777782]">{stat.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
