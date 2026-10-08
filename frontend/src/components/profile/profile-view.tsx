"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { mockProfileUser, type ProfileUser } from "@/mocks/profile";
import { EditProfileDialog } from "./edit-profile-dialog";
import { GamePerformance } from "./game-performance";
import { ProfileAchievements } from "./profile-achievements";
import { ProfileHeader } from "./profile-header";
import { ProfileRecentGames } from "./profile-recent-games";
import { ProfileStats } from "./profile-stats";

export function ProfileView() {
  const [user, setUser] = useState<ProfileUser>(mockProfileUser);
  const [editing, setEditing] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.45 }}
      className="space-y-4 sm:space-y-5"
    >
      <ProfileHeader user={user} onEdit={() => setEditing(true)} />
      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
        <ProfileStats user={user} />
        <GamePerformance wins={user.wins} gamesPlayed={user.gamesPlayed} winRate={user.winRate} />
      </div>
      <ProfileAchievements />
      <ProfileRecentGames />
      <EditProfileDialog open={editing} onOpenChange={setEditing} user={user} onSave={setUser} />
    </motion.div>
  );
}
