import type { Player } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "mehdi", name: "MEHDI", status: "READY", isYou: true, role: "HOST" },
  { id: "alex", name: "ALEX", status: "READY", isYou: false, role: "PLAYER" },
  { id: "sarah", name: "SARAH", status: "READY", isYou: false, role: "PLAYER" },
  { id: "yassine", name: "YASSINE", status: "NOT_READY", isYou: false, role: "PLAYER" },
  { id: "adam", name: "ADAM", status: "READY", isYou: false, role: "PLAYER" },
  { id: "sam", name: "SAM", status: "NOT_READY", isYou: false, role: "PLAYER" },
];
