import { UserStatistics } from "@/types/userData";

export default function PlayerStatistics({ stats }: { stats: UserStatistics }) {
    return (
        <div className="grid w-full gap-3 font-display sm:grid-cols-2 xs:grid-cols-2 lg:grid-cols-4
            *:rounded-xl *:border *:border-trap-border *:border-l-4 *:border-l-trap-primary *:bg-trap-panel *:p-4
            [&>div]:flex [&>div]:flex-col [&>div]:justify-between [&>div]:gap-5 [&_span]:rounded-lg [&_span]:bg-trap-bg [&_span]:px-2 [&_span]:py-1 [&_span]:text-lg
            [&_p]:mt-2 [&_p]:font-blackops [&_p]:text-3xl [&_p]:text-trap-primary-soft">
            <div>
                <div className='flex justify-between font-bold'>Total Games <span>🎮</span></div>
                <p>{stats.total_games}</p>
            </div>
            <div>
                <div className='flex justify-between font-bold'>Total Points <span>📊</span></div>
                <p>{stats.total_points}</p>
            </div>
            <div>
                <div className='flex justify-between font-bold'>Total Wins <span>🥇</span></div>
                <p>{stats.total_wins}</p>
            </div>
            <div>
                <div className='flex justify-between font-bold'>High Score <span>🎯</span></div>
                <p>{stats.high_score}</p>
            </div>
        </div>
    );
}
