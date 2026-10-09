import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FriendsView } from "@/components/friends/friends-view";
import { getUser, UserApiError } from "@/lib/getUser";
import { loginPathFor } from "@/lib/auth-routing";
import { redirect } from "next/navigation";
import { ProfileLoadError } from "@/components/profile/profile-load-error";

export const metadata: Metadata = {
  title: "Friends | Trivia Trap",
  description: "Find players and manage your Trivia Trap friends and requests.",
};

export default async function FriendsPage() {
  let user;
  try {
    user = await getUser({});
  } catch (error) {
    if (error instanceof UserApiError) {
      if (error.status === 401) redirect(loginPathFor("/friends"));
      return <DashboardShell><ProfileLoadError status={error.status} /></DashboardShell>;
    }
    throw error;
  }

  return (
    <DashboardShell user={user}>
      <FriendsView />
    </DashboardShell>
  );
}
