import ProfileHeader from "./ProfileHeader";
import PlayerStatistics from "./PlayerStatistics";
import PlayerAchievements from "./PlayerAchievements";
import PlayerAnalytics from "./PlayerAnalytics";
import { UserData } from "@/types/userData";


export type UserProps = {
    user: UserData;
    isOwner: boolean;// to render editable profile page
};


// this temporory nav bar, i will use the main navbar in the project
function NavBar()
{
    return (
        <div className="border">
            This is temp nav bar
        </div>
    );
}


export default function ProfilePage({ user, isOwner = false } : UserProps)
{
    return (
        <main className="w-full min-h-screen bg-[#111114]">
            <div className="mx-auto w-full min-h-screen relative max-w-[1440px] px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center justify-start gap-4">
                <NavBar/>
                <ProfileHeader
                    username={user.username}
                    join_date={user.join_date} 
                    banner_url={user.banner} 
                    avatar_url={user.avatar}
                    isOwner={isOwner}
                />
                <PlayerStatistics stats={user.stats} />
                <PlayerAchievements achievements={user.achievements} />
                <PlayerAnalytics analytics={user.analytics} />
            </div>
        </main>
    ); 
}
