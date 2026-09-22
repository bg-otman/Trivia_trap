import type { Player } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "mehdi", name: "MEHDI", status: "THINKING", isYou: true, role: "HOST" },
  { id: "alex", name: "ALEX", status: "SUBMITTED", isYou: false, role: "PLAYER" },
  { id: "sarah", name: "SARAH", status: "SUBMITTED", isYou: false, role: "PLAYER" },
  { id: "yassine", name: "YASSINE", status: "SUBMITTED", isYou: false, role: "PLAYER" },
  { id: "adam", name: "ADAM", status: "THINKING", isYou: false, role: "PLAYER" },
  { id: "sam", name: "SAM", status: "THINKING", isYou: false, role: "PLAYER" },
];
