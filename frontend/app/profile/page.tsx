
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
            description: "Achieve remontada on 10 games",
            img: "/achievements/bluffer.png",
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
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                        {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                        {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: true,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
            unlocked: false,
        },
                {
            name: "Einstein",
            description: "Get 10 correct answer in one game",
            img: "/achievements/bluffer.png",
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
            correct_answers: 10,
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
            correct_answers: 10,
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
            correct_answers: 10,
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