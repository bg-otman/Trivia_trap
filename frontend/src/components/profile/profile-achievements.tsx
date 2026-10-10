"use client";

import { motion } from "motion/react";
import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { UserAchievements } from "@/types/userData";
import { cn } from "@/lib/utils";
import { AchievementImage } from "./achievement-image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatAchievementName } from "@/lib/achievements";

export function ProfileAchievements({ achievements }: { achievements: UserAchievements[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-accent">Collection</p>
          <CardTitle className="mt-1 font-secondary text-lg uppercase">Achievements</CardTitle>
        </div>
        <Link href="/achievements" className="relative z-10 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#777782] transition-colors hover:text-white">
          View all <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {achievements.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-[#85858f]">No achievements are available yet.</p>
        ) : achievements.map((achievement) => (
            <motion.div
              key={achievement.name}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              className={cn(
                "relative min-h-36 overflow-hidden rounded-2xl border p-4 text-center transition-colors",
                achievement.unlocked ? "border-primary/25 bg-primary/[0.055]" : "border-white/[0.055] bg-black/15 opacity-55",
              )}
            >
              <span className={cn("mx-auto grid size-11 place-items-center rounded-2xl", achievement.unlocked ? "bg-primary/12 text-primary" : "bg-white/[0.05] text-[#777782]")}>
                <AchievementImage src={achievement.img} name={achievement.name} />
              </span>
              <h3 className="mt-3 text-[10px] font-black uppercase tracking-[0.08em] text-white">{formatAchievementName(achievement.name)}</h3>
              <p className="mt-1 text-[9px] leading-4 text-[#85858f]">{achievement.description}</p>
              {!achievement.unlocked && <LockKeyhole className="absolute right-2.5 top-2.5 size-3.5 text-[#777782]" aria-label="Locked" />}
            </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
