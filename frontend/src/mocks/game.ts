import { mockPlayers } from "@/mocks/players";
import type { GameState } from "@/types/game";

export const mockGame: GameState = {
  roomCode: "X7K9P2",
  currentRound: 2,
  totalRounds: 5,
  phase: "TRAP",
  timeRemaining: 18,
  settings: {
    totalRounds: 5,
    bluffTime: 30,
    voteTime: 30,
    maxPlayers: 6,
  },
  players: mockPlayers,
};
