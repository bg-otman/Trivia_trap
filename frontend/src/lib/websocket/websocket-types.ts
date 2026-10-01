export type GameConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";
export interface LobbyPlayerState { id: string; username: string; is_present: boolean; score: number; }
export interface LobbySettingsState { total_rounds: number; bluff_time: number; vote_time: number; max_players: number; language: string; }
export interface LobbyState { round: number; host_id: string; players: LobbyPlayerState[]; settings: LobbySettingsState; }
export interface LobbyUpdateMessage { event: "LOBBY_UPDATE"; data: LobbyState; }
export interface UpdateSettingsData {
  total_rounds: number;
  bluff_time: number;
  vote_time: number;
  max_players: number;
  language: string;
}
export interface UpdateSettingsMessage { event: "UPDATE_SETTINGS"; data: UpdateSettingsData; }
export interface ServerErrorData { code: "ROOM_NOT_FOUND" | "FORBIDDEN" | "PLAYER_NOT_FOUND" | "FULL_ROOM" | string; message: string; }
export interface ServerErrorMessage { event: "ERROR"; data: ServerErrorData; }
export type LobbyServerMessage = LobbyUpdateMessage | ServerErrorMessage;
