export type MatchHistory = {
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


export type UserStatistics = {
    total_games: number;
    total_wins: number;
    total_points: number;
    high_score: number;
};

export type UserData = {
    id: number;
    username: string;
    banner: string;
    avatar: string;
    join_date: Date;
    stats: UserStatistics;
    achievements: UserAchievements[];
    analytics: CategoryAnalytics[];
};

export type CurrentUser = {
    id: number;
    username: string;
    email: string;
};
