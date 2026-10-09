import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationsPage } from "@/components/notifications/notifications-page";
import { ProfileLoadError } from "@/components/profile/profile-load-error";
import { loginPathFor } from "@/lib/auth-routing";
import { getUser, UserApiError } from "@/lib/getUser";

export const metadata: Metadata = {
  title: "Notifications | Trivia Trap",
  description: "Review your latest Trivia Trap updates.",
};

export default async function NotificationsRoute() {
  let user;
  try {
    user = await getUser({});
  } catch (error) {
    if (error instanceof UserApiError) {
      if (error.status === 401 || error.status === 403) redirect(loginPathFor("/notifications"));
      return <DashboardShell><ProfileLoadError status={error.status} /></DashboardShell>;
    }
    throw error;
  }

  return (
    <DashboardShell user={user}>
      <NotificationsPage />
    </DashboardShell>
  );
}
