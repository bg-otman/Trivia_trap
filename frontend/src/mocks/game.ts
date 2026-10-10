import { mockPlayers } from "@/mocks/players";
import type { GameState } from "@/types/game";

export const mockGame: GameState = {
  roomCode: "X7K9P2",
  currentRound: 1,
  totalRounds: 5,
  phase: "LOBBY",
  timeRemaining: 18,
  settings: {
    totalRounds: 5,
    bluffTime: 30,
    voteTime: 20,
    maxPlayers: 10,
    language: "en",
  },
  players: mockPlayers,
};
