export type GameConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";
export interface LobbyPlayerState {
  id: string;
  username: string;
  is_present: boolean;
  score: number;
}
export interface LobbySettingsState {
  total_rounds: number;
  bluff_time: number;
  vote_time: number;
  max_players: number;
  language: string;
}
export interface LobbyState {
  round: number;
  host_id: string;
  players: LobbyPlayerState[];
  settings: LobbySettingsState;
}
export interface LobbyUpdateMessage {
  event: "LOBBY_UPDATE";
  data: LobbyState;
}
export interface UpdateSettingsData {
  total_rounds: number;
  bluff_time: number;
  vote_time: number;
  max_players: number;
  language: string;
}
export interface UpdateSettingsMessage {
  event: "UPDATE_SETTINGS";
  data: UpdateSettingsData;
}
export interface KickPlayerData {
  player_id: string;
}
export interface KickPlayerMessage {
  event: "KICK_PLAYER";
  data: KickPlayerData;
}
export interface NextPhaseMessage {
  event: "NEXT_PHASE";
  data: Record<string, never>;
}
export interface CategoryOptionState {
  id: number;
  name: string;
  image_url: string | null;
}
export interface CategoryPhaseData {
  round: number;
  total_rounds: number;
  duration: number;
  categories: CategoryOptionState[];
}
export interface CategoryPhaseMessage {
  event: "PHASE_CATEGORY";
  data: CategoryPhaseData;
}
export interface GetQuestionCategoryData {
  id: number;
  name: string;
  language: string;
}
export interface GetQuestionMessage {
  event: "GET_QUESTION";
  data: { category: GetQuestionCategoryData };
}
export interface QuestionPhaseData {
  category: string;
  question: string;
  question_id: number;
  duration: number;
  image_url: string | null;
  round: number;
  total_rounds: number;
}
export interface QuestionPhaseMessage {
  event: "PHASE_QUESTION";
  data: QuestionPhaseData;
}
export interface ChatMessageState {
  player: { id: string; username: string; avatar_url?: string | null };
  message: string;
}
export interface ChatMessageEvent {
  event: "CHAT_MESSAGE";
  data: ChatMessageState;
}
export interface ServerErrorData {
  code:
    | "ROOM_NOT_FOUND"
    | "FORBIDDEN"
    | "PLAYER_NOT_FOUND"
    | "FULL_ROOM"
    | string;
  message: string;
}
export interface ServerErrorMessage {
  event: "ERROR";
  data: ServerErrorData;
}
export type LobbyServerMessage =
  | LobbyUpdateMessage
  | ChatMessageEvent
  | CategoryPhaseMessage
  | QuestionPhaseMessage
  | ServerErrorMessage;
