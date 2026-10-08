import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FriendsView } from "@/components/friends/friends-view";

export const metadata: Metadata = {
  title: "Friends | Trivia Trap",
  description: "Find players and manage your Trivia Trap friends and requests.",
};

export default function FriendsPage() {
  return (
    <DashboardShell>
      <FriendsView />
    </DashboardShell>
  );
}
