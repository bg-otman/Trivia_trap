import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FriendsOnline } from "@/components/dashboard/friends-online";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecentGames } from "@/components/dashboard/recent-games";
import { requireUser } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Dashboard | Trivia Trap",
  description: "Your Trivia Trap games, friends, scores, and recent activity.",
};

export default async function DashboardPage() {
  await requireUser("/dashboard");
  return (
    <DashboardShell>
      <DashboardHeader />
      <div className="mt-6 lg:mt-8">
        <QuickStats />
      </div>
      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <RecentGames />
        <FriendsOnline />
      </div>
      <div className="mt-4">
        <RecentActivity />
      </div>
    </DashboardShell>
  );
}
