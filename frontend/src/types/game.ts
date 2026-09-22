import type { Player } from "./player";

export type GamePhase =
  | "LOBBY"
  | "CATEGORY"
  | "QUESTION"
  | "BLUFF"
  | "VOTING"
  | "RESULTS_REVEAL"
  | "ROUND_RESULTS"
  | "FINAL_RESULTS";

export interface GameSettings {
  totalRounds: number;
  bluffTime: number;
  voteTime: number;
  maxPlayers: number;
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