import { UserStatistics } from './ProfilePage';

export default function PlayerStatistics({ stats }: { stats: UserStatistics }) {
    return (
        <div className="w-full grid gap-4 sm:grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 font-blackops text-2xl
            *:border-2 *:border-[#5B5FEF] *:p-3 *:rounded-md *:bg-[#0b1329] [&>div]:flex [&>div]:flex-col [&>div]:justify-between [&>div]:gap-5
            [&_span]:bg-[#000000e8] [&_span]:px-2 [&_span]:py-1 [&_span]:rounded-md
            [&_p]:mt-2">
            <div>
                <div className='flex justify-between'>Total Games <span>🎮</span></div>
                <p>{stats.total_games}</p>
            </div>
            <div>
                <div className='flex justify-between'>Total Points <span>📊</span></div>
                <p>{stats.total_points}</p>
            </div>
            <div>
                <div className='flex justify-between'>Total Wins <span>🥇</span></div>
                <p>{stats.total_wins}</p>
            </div>
            <div>
                <div className='flex justify-between'>High Score <span>🎯</span></div>
                <p>{stats.high_score}</p>
            </div>
        </div>
    );
}
