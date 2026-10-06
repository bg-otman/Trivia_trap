import ProfilePage from "@/components/Profile/ProfilePage";
import { getUser, UserApiError } from "@/lib/getUser";
import { redirect } from "next/navigation";
import type { UserData } from "@/types/userData";


export default async function Profile() {
    let user: UserData;

    try {
        user = await getUser({ username: undefined });
    } catch (error) {
        if (!(error instanceof UserApiError) || error.status !== 401) {
            throw error;
        }
        redirect("/login?next=/profile");
    }

    return (
        <div>
            <ProfilePage user={user} isOwner={true} />
        </div>
    );
}