export type PlayerRole = "HOST" | "PLAYER";

export type PlayerStatus =
    | "ONLINE"
    | "THINKING"
    | "SUBMITTED"
    | "VOTED"
    | "OFFLINE";

export interface Player {
    id: string;
    name: string;
    avatar?: string;

    role: PlayerRole;
    status: PlayerStatus;

    isYou: boolean;
    score?: number;
}
