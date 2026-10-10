import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6" aria-label="Loading settings">
        <Skeleton className="h-20 w-[32rem] max-w-full" />
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-[20px]" />)}
        </div>
      </div>
    </DashboardShell>
  );
}
