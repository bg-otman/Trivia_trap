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
        <div className="flex w-full items-center justify-between border-b border-trap-border/70 py-4">
            <span className="font-secondary text-lg tracking-tight text-trap-text">
                TRIVIA<span className="text-trap-primary">TRAP</span>
            </span>
            <span className="rounded-full border border-trap-secondary/40 bg-trap-secondary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-trap-secondary-soft">
                Player card
            </span>
        </div>
    );
}


export default function ProfilePage({ user, isOwner = false } : UserProps)
{
    return (
        <main className="trap-grid-glow w-full min-h-screen bg-trap-bg">
            <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-center justify-start gap-5 px-4 pb-12 sm:px-8 md:px-12 lg:px-16">
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
