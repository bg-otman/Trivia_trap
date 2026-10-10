import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return <DashboardShell><div className="space-y-6"><Skeleton className="h-20 w-80 max-w-full" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div>{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}</div></DashboardShell>;
}
