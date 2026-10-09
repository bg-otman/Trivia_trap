"use client";

import { useMemo, useState } from "react";
import { Award, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { AchievementCard } from "./achievement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { UserAchievements } from "@/types/userData";

type AchievementFilter = "all" | "unlocked" | "locked";

export function AchievementsPage({ achievements }: { achievements: UserAchievements[] }) {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  const locked = achievements.length - unlocked;
  const completion = achievements.length === 0 ? 0 : Math.round((unlocked / achievements.length) * 100);
  const filtered = useMemo(() => achievements.filter((achievement) => (
    filter === "all" || (filter === "unlocked" ? achievement.unlocked : !achievement.unlocked)
  )), [achievements, filter]);
  const filters: { value: AchievementFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: achievements.length },
    { value: "unlocked", label: "Unlocked", count: unlocked },
    { value: "locked", label: "Locked", count: locked },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Trophy room</p>
        <h1 className="mt-2 font-secondary text-3xl uppercase text-white sm:text-4xl">Achievements</h1>
        <p className="mt-2 text-sm text-muted-foreground">Every correct answer. Every perfect bluff. Every milestone.</p>
      </header>

      <section aria-label="Achievement summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total achievements", value: achievements.length, icon: Award, color: "text-[#9295ff]" },
          { label: "Unlocked", value: unlocked, icon: CheckCircle2, color: "text-trap-success" },
          { label: "Locked", value: locked, icon: LockKeyhole, color: "text-[#85858f]" },
          { label: "Completion", value: `${completion}%`, icon: Sparkles, color: "text-accent" },
        ].map((item) => (
          <Card key={item.label} className="border-white/[0.07] bg-trap-surface">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#85858f]">{item.label}</p>
                <item.icon className={`size-4 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="mt-3 font-secondary text-2xl text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {achievements.length === 0 ? (
        <Card className="border-white/[0.07] bg-trap-surface">
          <EmptyState icon={Award} title="No achievements yet" description="Achievements will appear here as you progress through Trivia Trap." className="py-14" />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter achievements">
            {filters.map((item) => (
              <Button key={item.value} type="button" size="sm" variant={filter === item.value ? "default" : "surface"} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
                {item.label} <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[9px]">{item.count}</span>
              </Button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <Card className="border-white/[0.07] bg-trap-surface">
              <EmptyState icon={filter === "locked" ? LockKeyhole : CheckCircle2} title={`No ${filter} achievements`} description={`There are no ${filter} achievements in your collection right now.`} className="py-12" />
            </Card>
          ) : (
            <section aria-label={`${filter} achievements`} className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((achievement) => <AchievementCard key={achievement.name} achievement={achievement} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
