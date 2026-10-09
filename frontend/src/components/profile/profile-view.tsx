"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { UserData } from "@/types/userData";
import { GamePerformance } from "./game-performance";
import { ProfileAchievements } from "./profile-achievements";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";

export function ProfileView({ user }: { user: UserData }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.45 }}
      className="space-y-4 sm:space-y-5"
    >
      <ProfileHeader user={user} />
      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
        <ProfileStats user={user} />
        <GamePerformance analytics={user.analytics} />
      </div>
      <ProfileAchievements achievements={user.achievements} />
    </motion.div>
  );
}
