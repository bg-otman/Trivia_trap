export type ProfileUser = {
  displayName: string;
  username: string;
  bio: string;
  memberSince: number;
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  friends: number;
  friendsOnline: number;
  avatarUrl: string | null;
};

export type ProfileAchievement = {
  name: string;
  description: string;
  icon: "trophy" | "mask" | "fire" | "crown" | "target" | "star";
  unlocked: boolean;
};

export type ProfileGame = {
  title: string;
  result: "WIN" | "LOSS";
  placement: string;
  points: number;
  playedAt: string;
};

export type ProfileFriend = {
  name: string;
  initials: string;
  online: boolean;
  color: string;
};

export const mockProfileUser: ProfileUser = {
  displayName: "Mehdi",
  username: "mehdielkabia",
  bio: "Building games, breaking answers.",
  memberSince: 2026,
  level: 12,
  title: "Trap Master",
  xp: 1240,
  nextLevelXp: 1700,
  gamesPlayed: 24,
  wins: 12,
  winRate: 50,
  totalScore: 8420,
  bestScore: 1240,
  currentStreak: 3,
  friends: 24,
  friendsOnline: 4,
  avatarUrl: null,
};

export const profileAchievements: ProfileAchievement[] = [
  { name: "First Win", description: "Won your first game", icon: "trophy", unlocked: true },
  { name: "Bluff Master", description: "Successfully fooled 10 players", icon: "mask", unlocked: true },
  { name: "On Fire", description: "Won 3 games in a row", icon: "fire", unlocked: true },
  { name: "Champion", description: "Finished 1st place 10 times", icon: "crown", unlocked: true },
  { name: "Sharp Mind", description: "Answer 25 truths correctly", icon: "target", unlocked: false },
  { name: "Legend", description: "Reach level 20", icon: "star", unlocked: false },
];

export const profileRecentGames: ProfileGame[] = [
  { title: "Trivia Night", result: "WIN", placement: "1st Place", points: 420, playedAt: "2 hours ago" },
  { title: "Friday Chaos", result: "LOSS", placement: "4th Place", points: 180, playedAt: "Yesterday" },
  { title: "Science Trap", result: "WIN", placement: "1st Place", points: 510, playedAt: "2 days ago" },
];

export const profileFriends: ProfileFriend[] = [
  { name: "Alex", initials: "AX", online: true, color: "bg-[#5b5fef]" },
  { name: "Sarah", initials: "SA", online: true, color: "bg-[#ff6b35]" },
  { name: "Yassine", initials: "YA", online: true, color: "bg-[#167a46]" },
  { name: "Adam", initials: "AD", online: true, color: "bg-[#8b5a10]" },
  { name: "Nora", initials: "NO", online: false, color: "bg-[#704f78]" },
];
