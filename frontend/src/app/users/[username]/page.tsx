import ProfilePage from "@/components/Profile/ProfilePage";
import { getUser, UserApiError } from "@/lib/getUser";
import { cookies } from "next/dist/server/request/cookies";
import { notFound, redirect } from "next/navigation";



export default async function UserProfile({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    try {
        const user = await getUser({ username });
        let isOwner = false;
        // here i need to check if the user is the owner, to be implemented in later.
        // if (username === getCurrentUser()?.username) {
        //     isOwner = true;
        // }
        return <ProfilePage user={user} isOwner={isOwner} />;
    } catch (error) 
    {
        if (error instanceof UserApiError && error.status === 404) 
            notFound();  
        else
        {
            if (!(error instanceof UserApiError) || error.status !== 401)
                throw error;
            redirect("/login?next=/profile");
        }
    }
}
