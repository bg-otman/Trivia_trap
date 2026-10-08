export type ClientEvent =
    | "START_GAME"
    | "SUBMIT_BLUFF"
    | "SUBMIT_VOTE"
    | "CHAT_MESSAGE"
    | "UPDATE_SETTINGS"
    | "KICK_PLAYER"
    | "LEAVE_ROOM"
    | "NEXT_PHASE"
    | "GET_QUESTION";

export type ServerEvent =
    | "LOBBY_UPDATE"
    | "PHASE_CATEGORY"
    | "PHASE_TRAP"
    | "PHASE_VOTING"
    | "RESULTS_REVEALED";

export interface WebSocketMessage<T = unknown> {
    event: ClientEvent | ServerEvent;
    data: T;
}
