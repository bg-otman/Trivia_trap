"use client";

import { motion } from "motion/react";
import { Flame, Gamepad2, Medal, Star, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ProfileUser } from "@/mocks/profile";

export function ProfileStats({ user }: { user: ProfileUser }) {
  const reducedMotion = useReducedMotion();
  const stats = [
    { label: "Games played", value: user.gamesPlayed.toLocaleString(), icon: Gamepad2, color: "text-[#9295ff]" },
    { label: "Wins", value: user.wins.toLocaleString(), icon: Trophy, color: "text-accent" },
    { label: "Win rate", value: `${user.winRate}%`, icon: Target, color: "text-trap-success" },
    { label: "Total score", value: user.totalScore.toLocaleString(), icon: Medal, color: "text-primary" },
    { label: "Best score", value: user.bestScore.toLocaleString(), icon: Star, color: "text-accent" },
    { label: "Current streak", value: user.currentStreak.toLocaleString(), icon: Flame, color: "text-trap-danger" },
  ];

  return (
    <section aria-labelledby="profile-stats-title">
      <h2 id="profile-stats-title" className="mb-3 font-secondary text-base uppercase text-white">Player stats</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : index * 0.04 }}>
            <Card className="h-full rounded-2xl border border-white/[0.07] bg-trap-surface py-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.13em] text-[#777782] sm:text-[9px]">{stat.label}</p>
                  <stat.icon className={`size-3.5 ${stat.color}`} aria-hidden="true" />
                </div>
                <p className="mt-3 font-secondary text-xl text-white sm:text-2xl">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
