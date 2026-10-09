"use client";

import { motion } from "motion/react";
import { Crown, Drama, Flame, LockKeyhole, Star, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { profileAchievements } from "@/mocks/profile";
import { cn } from "@/lib/utils";

const achievementIcons = { trophy: Trophy, mask: Drama, fire: Flame, crown: Crown, target: Target, star: Star };

export function ProfileAchievements() {
  const reducedMotion = useReducedMotion();

  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-accent">Collection</p>
          <CardTitle className="mt-1 font-secondary text-lg uppercase">Achievements</CardTitle>
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-[9px] text-[#a6a6ae]">View all achievements</Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {profileAchievements.map((achievement) => {
          const Icon = achievementIcons[achievement.icon];
          return (
            <motion.div
              key={achievement.name}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              className={cn(
                "relative min-h-36 overflow-hidden rounded-2xl border p-4 text-center transition-colors",
                achievement.unlocked ? "border-primary/25 bg-primary/[0.055]" : "border-white/[0.055] bg-black/15 opacity-55",
              )}
            >
              <span className={cn("mx-auto grid size-11 place-items-center rounded-2xl", achievement.unlocked ? "bg-primary/12 text-primary" : "bg-white/[0.05] text-[#777782]")}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-[10px] font-black uppercase tracking-[0.08em] text-white">{achievement.name}</h3>
              <p className="mt-1 text-[9px] leading-4 text-[#85858f]">{achievement.description}</p>
              {!achievement.unlocked && <LockKeyhole className="absolute right-2.5 top-2.5 size-3.5 text-[#777782]" aria-label="Locked" />}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
