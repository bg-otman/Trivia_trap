import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AchievementsPage } from "@/components/achievements/achievements-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileLoadError } from "@/components/profile/profile-load-error";
import { loginPathFor } from "@/lib/auth-routing";
import { getUser, UserApiError } from "@/lib/getUser";

export const metadata: Metadata = {
  title: "Achievements | Trivia Trap",
  description: "Review your unlocked and upcoming Trivia Trap achievements.",
};

export default async function AchievementsRoute() {
  let user;
  try {
    user = await getUser({});
  } catch (error) {
    if (error instanceof UserApiError) {
      if (error.status === 401 || error.status === 403) redirect(loginPathFor("/achievements"));
      return <DashboardShell><ProfileLoadError status={error.status} /></DashboardShell>;
    }
    throw error;
  }

  return (
    <DashboardShell user={user}>
      <AchievementsPage achievements={user.achievements} />
    </DashboardShell>
  );
}
