export type PlayerRole = "HOST" | "PLAYER";

export type PlayerStatus =
  | "READY"
  | "NOT_READY"
  | "THINKING"
  | "SUBMITTED"
  | "VOTED"
  | "OFFLINE";

export type GamePhase =
  | "LOBBY"
  | "CATEGORY"
  | "QUESTION"
  | "BLUFF"
  | "VOTING"
  | "RESULTS_REVEAL"
  | "ROUND_RESULTS"
  | "FINAL_RESULTS";

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role: PlayerRole;
  status: PlayerStatus;
  isYou: boolean;
}