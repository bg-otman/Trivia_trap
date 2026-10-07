export interface ChatMessageData {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  text: string;
  timestamp: string;
  isYou: boolean;
}
