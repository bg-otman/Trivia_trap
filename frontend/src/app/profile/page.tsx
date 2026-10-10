import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileView } from "@/components/profile/profile-view";
import { getUser, UserApiError } from "@/lib/getUser";
import { loginPathFor } from "@/lib/auth-routing";
import { redirect } from "next/navigation";
import { ProfileLoadError } from "@/components/profile/profile-load-error";

export const metadata: Metadata = {
  title: "Profile | Trivia Trap",
  description: "Your Trivia Trap player identity, stats, achievements, and recent games.",
};

export default async function ProfilePage() {
  let user;
  try {
    user = await getUser({});
  } catch (error) {
    if (error instanceof UserApiError) {
      if (error.status === 401) redirect(loginPathFor("/profile"));
      return <DashboardShell><ProfileLoadError status={error.status} /></DashboardShell>;
    }
    throw error;
  }

  return (
    <DashboardShell user={user}>
      <ProfileView user={user} isOwner />
    </DashboardShell>
  );
}
