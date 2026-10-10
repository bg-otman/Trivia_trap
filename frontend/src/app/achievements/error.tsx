"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ErrorState } from "@/components/ui/error-state";

export default function AchievementsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <DashboardShell>
      <ErrorState
        title="Achievements unavailable"
        description="We couldn't load your achievement collection. Please try again."
        actionLabel="Try again"
        onAction={reset}
        className="mx-auto mt-16 max-w-xl"
      />
    </DashboardShell>
  );
}
