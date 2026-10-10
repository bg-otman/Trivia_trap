import type { Player } from "./player";

export type GamePhase =
  | "LOBBY"
  | "CATEGORY"
  | "TRAP"
  | "VOTING"
  | "RESULTS_REVEAL"
  | "ROUND_RESULTS"
  | "FINAL_RESULTS";

export type GameLanguage = "en" | "ar";

export interface GameSettings {
  totalRounds: number;
  bluffTime: number;
  voteTime: number;
  maxPlayers: number;
  language: GameLanguage;
}

export interface GameState {
  roomCode: string;

  currentRound: number;
  totalRounds: number;

  phase: GamePhase;

  timeRemaining: number;

  settings: GameSettings;

  players: Player[];
}
