import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AchievementsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6" aria-label="Loading achievements">
        <Skeleton className="h-20 w-[32rem] max-w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 w-72 max-w-full" />
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-[20px]" />)}
        </div>
      </div>
    </DashboardShell>
  );
}
