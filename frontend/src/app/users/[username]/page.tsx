import type { Metadata } from "next";
import { getUser, UserApiError } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";
import { loginPathFor } from "@/lib/auth-routing";
import { ProfileView } from "@/components/profile/profile-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username} | Trivia Trap`,
        description: `View ${username}'s public Trivia Trap profile.`,
    };
}


export default async function UserProfile({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    let user;
    let currentUser;

    try {
        currentUser = await getUser({});
        user = currentUser.username.toLocaleLowerCase() === username.toLocaleLowerCase()
            ? currentUser
            : await getUser({ username });
    } catch (error) {
        if (error instanceof UserApiError && error.status === 404) notFound();
        if (error instanceof UserApiError && (error.status === 401 || error.status === 403)) {
            redirect(loginPathFor(`/users/${encodeURIComponent(username)}`));
        }
        throw error;
    }

    const isOwner = currentUser.id === user.id;
    return (
        <DashboardShell user={currentUser}>
            <ProfileView user={user} isOwner={isOwner} />
        </DashboardShell>
    );
}
