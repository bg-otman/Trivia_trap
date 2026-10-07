import type { Player } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "mehdi", name: "MEHDI", status: "ONLINE", isYou: true, role: "HOST" },
  { id: "alex", name: "ALEX", status: "ONLINE", isYou: false, role: "PLAYER" },
  { id: "sarah", name: "SARAH", status: "ONLINE", isYou: false, role: "PLAYER" },
  { id: "yassine", name: "YASSINE", status: "ONLINE", isYou: false, role: "PLAYER" },
  { id: "adam", name: "ADAM", status: "ONLINE", isYou: false, role: "PLAYER" },
  { id: "sam", name: "SAM", status: "ONLINE", isYou: false, role: "PLAYER" },
];
