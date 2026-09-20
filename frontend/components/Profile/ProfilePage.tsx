import ProfileHeader from "./ProfileHeader";
import PlayerStatistics from "./PlayerStatistics";
import PlayerAchievements from "./PlayerAchievements";
import PlayerAnalytics from "./PlayerAnalytics";


export type UserAchievements = {
    name: string;
    description: string;
    img: string;
    unlocked: boolean;
};

export type CategoryAnalytics = {
    category: string;
    total_rounds: number;
    knowledge_accuracy: number;
    bluff_efficiency: number;
};

export type GameData = {
    id: string;
    end_time: Date;
    total_rounds: number;
    player_numbers: number;
    host_username: string;
    winner_username: string;
    rank: number;
    score: number;
    correct_answers: number;
    bluffs: number;
};

export type UserStatistics = {
    total_games: number;
    total_wins: number;
    total_points: number;
    high_score: number;
};

type UserData = {
    id: string;
    username: string;
    banner: string;
    avatar: string;
    join_date: Date;
    stats: UserStatistics;
    achievements: UserAchievements[];
    gameData: GameData[];
    analytics: CategoryAnalytics[];
};

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
