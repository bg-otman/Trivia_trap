"use client";

import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ErrorState } from "@/components/ui/error-state";

export default function UserProfileError({ reset }: { error: Error; reset: () => void }) {
    const router = useRouter();

    return (
        <DashboardShell>
            <ErrorState
                title="Profile unavailable"
                description="We couldn't load this player right now. Check your connection and try again."
                actionLabel="Try again"
                onAction={reset}
                secondaryActionLabel="Back to dashboard"
                onSecondaryAction={() => router.push("/dashboard")}
                className="mx-auto mt-16 max-w-xl"
            />
        </DashboardShell>
    );
}
