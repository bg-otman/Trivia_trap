import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileLoading() {
    return (
        <DashboardShell>
            <div className="space-y-5" aria-label="Loading player profile">
                <Skeleton className="h-52 rounded-[20px]" />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-64 rounded-[20px]" />
                </div>
                <Skeleton className="h-56 rounded-[20px]" />
            </div>
        </DashboardShell>
    );
}
