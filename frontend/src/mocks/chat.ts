import type { ChatMessageData } from "@/types/chat";

export const mockChatMessages: ChatMessageData[] = [
  {
    id: "message-1",
    playerId: "alex",
    playerName: "ALEX",
    text: "Ready for round one?",
    timestamp: "20:41",
    isYou: false,
  },
  {
    id: "message-2",
    playerId: "sarah",
    playerName: "SARAH",
    text: "I already have the perfect traps 😈",
    timestamp: "20:42",
    isYou: false,
  },
  {
    id: "message-3",
    playerId: "mehdi",
    playerName: "MEHDI",
    text: "Good luck fooling me.",
    timestamp: "20:42",
    isYou: true,
  },
];
