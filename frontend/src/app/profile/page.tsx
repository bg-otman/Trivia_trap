
import ProfilePage, { MatchHistory } from "@/components/Profile/ProfilePage";
import { UserAchievements, CategoryAnalytics } from "@/components/Profile/ProfilePage";


export async function getUserData( username : string)
{
    // this function should fetch user data if user exist.
    // if !user return null

    const mock_analytics : CategoryAnalytics[] = [
            {
                "category": "Science",
                "total_rounds": 42,
                "knowledge_accuracy": 68.5,
                "bluff_efficiency": 45.2,
            },
            {
                "category": "History",
                "total_rounds": 35,
                "knowledge_accuracy": 54.0,
                "bluff_efficiency": 71.4,
            },
            {
                "category": "Geography",
                "total_rounds": 28,
                "knowledge_accuracy": 75.0,
                "bluff_efficiency": 32.1,
            },
            {
                "category": "Pop Culture",
                "total_rounds": 22,
                "knowledge_accuracy": 81.8,
                "bluff_efficiency": 50.0,
            },
            {
                "category": "Literature",
                "total_rounds": 15,
                "knowledge_accuracy": 40.0,
                "bluff_efficiency": 60.0,
            }
        ];

    const mock_achievements: UserAchievements[] = [
        {
            name: "Remontada Master",
            description: "Win a game after being in last place halfway through",
            img: "/achievements/remontada_master.png",
            unlocked: false,
        },
        {
            name: "BLUFFER",
            description: "Bluff all the player in a game of 5",
            img: "/achievements/bluffer.png",
            unlocked: true,
        },
        {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/einstein.png",
            unlocked: false,
        },
                {
            name: "Deception Master",
            description: "Make players vote for your bluffs 25 times across all games",
            img: "/achievements/deception_master.png",
            unlocked: false,
        },
                {
            name: "On Fire",
            description: "Earn at least 1 point in all rounds of a game",
            img: "/achievements/on_fire.png",
            unlocked: false,
        },
                {
            name: "Truth Seeker",
            description: "Choose the correct answer 5 rounds in a row",
            img: "/achievements/truth_seeker.png",
            unlocked: false,
        },
                {
            name: "Perfect Trap",
            description: "Make every other player choose your bluff in one round",
            img: "/achievements/perfect_trap.png",
            unlocked: false,
        },
                {
            name: "Lone Genius",
            description: "Be the only player to choose the correct answer in a round",
            img: "/achievements/lone_genius.png",
            unlocked: false,
        },
                {
            name: "First Victory",
            description: "Win your first Trivia Trap game",
            img: "/achievements/first_victory.png",
            unlocked: false,
        },
                {
            name: "Champion",
            description: "Win 10 Trivia Trap games",
            img: "/achievements/champion.png",
            unlocked: false,
        },
                {
            name: "Veteran",
            description: "Play 30 Trivia Trap games",
            img: "/achievements/veteran.png",
            unlocked: false,
        },
                        {
            name: "Messssi",
            description: "Earn 100 points across all games",
            img: "/achievements/messi.png",
            unlocked: false,
        },
                {
            name: "Collector",
            description: "Unlock 10 achievements",
            img: "/achievements/collector.png",
            unlocked: false,
        },
    ];

    const mock_matchHistory : MatchHistory[] = [
        {
            id: "51",
            end_time: new Date(),
            total_rounds: 10,
            player_numbers: 5,
            host_username: "ali",
            winner_username: "rachid",
            rank: 1,
            score: 17,
            correct_answers: 10,
            bluffs: 5,
        },
        {
            id: "55",
            end_time: new Date(),
            total_rounds: 10,
            player_numbers: 5,
            host_username: "ali",
            winner_username: "rachid",
            rank: 2,
            score: 17,
            correct_answers: 8,
            bluffs: 5,
        },
        {
            id: "52",
            end_time: new Date(),
            total_rounds: 10,
            player_numbers: 5,
            host_username: "ali",
            winner_username: "rachid",
            rank: 3,
            score: 17,
            correct_answers: 2,
            bluffs: 5,
        },
        {
            id: "58",
            end_time: new Date(),
            total_rounds: 10,
            player_numbers: 5,
            host_username: "ali",
            winner_username: "rachid",
            rank: 4,
            score: 17,
            correct_answers: 7,
            bluffs: 5,
        },
    ];

    const mock_data = {
        id: "123",
        username: "b.othmane",
        avatar: "/avatars/a1.png", // use the one exist in the db or the default if none
        banner: "/banners/banner2.png",
        join_date: new Date("9/10/2026"),
        stats: {
            total_games: 100,
            total_wins: 50,
            total_points: 2000,
            high_score: 300,
        },
        achievements: mock_achievements,
        matchHistory: mock_matchHistory,
        analytics: mock_analytics,
    };

    return mock_data;
}

export default async function Profile()
{
    const loggedUser = "b.othmane"; // here i need to fetch the logged user.
    // if (!loggedUser) return redirect(loginPage);

    const user = await getUserData(loggedUser);
    // if !user return UserNotFoundPage
    return (
        <div>
            <ProfilePage user={user} isOwner={true} />
        </div>
    );
}