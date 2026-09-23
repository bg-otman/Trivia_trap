import ProfilePage from "@/components/Profile/ProfilePage";
import { getUserData } from "@/app/profile/page";

type Props = {
    params: Promise<{
        username: string;
    }>;
};

export default async function UserProfile({ params }: Props) {
    const { username } = await params;
    const user = await getUserData(username);
    // if user == currentLoggedUser return redirect(/profile)
    // if !user return UserNotFoundPage
    user.username = username; // this just for now because i'm using mock data
    return <ProfilePage user={user} isOwner={false} />;
}