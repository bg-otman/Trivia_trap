
import ProfilePage from "@/components/Profile/ProfilePage";
import { UserProps } from "@/components/Profile/ProfilePage";


export async function getUserData( username : string)
{
    // this function should fetch user data if user exist.
    // if !user return null

    const mock_achievements = [
        {
            name: "Remontada Master",
            description: "Achieve remontada on 10 games",
            img: "path_to_achievement_img",
        },
    ];

    const mock_game_data = [
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
    ];

    const mock_data = {
        id: "123",
        username: "b.othmane",
        avatar: "/avatars/a1.png", // use the one exist in the db or the default if none
        banner: "/banners/banner2.png",
        join_date: new Date("9/10/2026"),
        total_games: 200,
        total_wins: 150,
        total_points: 356,
        high_score: 22,
        achievements: mock_achievements,
        gameData: mock_game_data,
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
            <h1>From profile page -_+</h1>
            <ProfilePage user={user} isOwner={true} />
        </div>
    );
}