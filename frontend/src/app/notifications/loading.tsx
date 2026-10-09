import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6" aria-label="Loading notifications">
        <Skeleton className="h-20 w-[32rem] max-w-full" />
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[20px]" />)}
      </div>
    </DashboardShell>
  );
}
