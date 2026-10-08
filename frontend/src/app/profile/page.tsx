import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileView } from "@/components/profile/profile-view";
import { requireUser } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Profile | Trivia Trap",
  description: "Your Trivia Trap player identity, stats, achievements, and recent games.",
};

export default async function ProfilePage() {
  await requireUser("/profile");
  return (
    <DashboardShell>
      <ProfileView />
    </DashboardShell>
  );
}
