"use client";

import { Check, LockKeyhole } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { AchievementImage } from "@/components/profile/achievement-image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { formatAchievementName } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import type { UserAchievements } from "@/types/userData";

export function AchievementCard({ achievement }: { achievement: UserAchievements }) {
  const reducedMotion = useReducedMotion();
  const displayName = formatAchievementName(achievement.name);

  return (
    <motion.article
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative flex min-h-64 flex-col overflow-hidden rounded-[20px] border bg-trap-surface p-5 shadow-[0_16px_36px_rgba(0,0,0,0.14)]",
        achievement.unlocked ? "border-primary/25" : "border-white/[0.07]",
      )}
    >
      <div aria-hidden="true" className={cn("pointer-events-none absolute -right-12 -top-12 size-32 rounded-full blur-3xl", achievement.unlocked ? "bg-primary/10" : "bg-white/[0.025]")} />
      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("grid size-16 place-items-center rounded-2xl border", achievement.unlocked ? "border-primary/20 bg-primary/10 text-primary" : "border-white/[0.07] bg-black/15 text-[#777782] grayscale opacity-70")}>
          <span className="[&_img]:size-10 [&_svg]:size-7"><AchievementImage src={achievement.img} name={displayName} /></span>
        </span>
        <Badge className={cn("border-0 px-2.5 py-1 text-[9px] font-black", achievement.unlocked ? "bg-trap-success/10 text-trap-success" : "bg-white/[0.055] text-[#85858f]")}>
          {achievement.unlocked ? <Check className="size-3" /> : <LockKeyhole className="size-3" />}
          {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
        </Badge>
      </div>
      <div className={cn("relative mt-auto pt-8", !achievement.unlocked && "opacity-70")}>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#777782]">{achievement.name}</p>
        <h2 className="mt-2 font-secondary text-lg uppercase text-white">{displayName}</h2>
        <p className="mt-2 text-xs leading-5 text-[#a6a6ae]">{achievement.description}</p>
      </div>
    </motion.article>
  );
}
