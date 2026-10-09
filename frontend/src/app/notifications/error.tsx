"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ErrorState } from "@/components/ui/error-state";

export default function NotificationsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <DashboardShell>
      <ErrorState title="Notifications unavailable" description="We couldn't load your notifications. Please try again." actionLabel="Try again" onAction={reset} className="mx-auto mt-16 max-w-xl" />
    </DashboardShell>
  );
}
