import ProfilePage from "@/components/Profile/ProfilePage";
import { getUser, UserApiError, getCurrentUser } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";



export default async function UserProfile({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    let user;
    let isOwner = false;

    try {
        user = await getUser({ username });
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            isOwner = true;
        }
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
    return <ProfilePage user={user} isOwner={isOwner} />;
}
