import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HistoryView } from "@/components/history/history-view";
import { ProfileLoadError } from "@/components/profile/profile-load-error";
import { loginPathFor } from "@/lib/auth-routing";
import { getGameHistory } from "@/lib/game-history";
import { getUser, UserApiError } from "@/lib/getUser";

export const metadata: Metadata = {
  title: "Game History | Trivia Trap",
  description: "Review your completed Trivia Trap matches.",
};

export default async function HistoryPage() {
  let user;
  let history;
  try {
    [user, history] = await Promise.all([getUser({}), getGameHistory()]);
  } catch (error) {
    if (error instanceof UserApiError) {
      if (error.status === 401) redirect(loginPathFor("/history"));
      return <DashboardShell><ProfileLoadError status={error.status} /></DashboardShell>;
    }
    throw error;
  }
  return <DashboardShell user={user}><HistoryView initialData={history} /></DashboardShell>;
}
