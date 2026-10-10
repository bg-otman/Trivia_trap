import type { GameLanguage } from "@/types/game";

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
  language: GameLanguage;
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
export interface ReturnedToLobbyMessage {
  event: "RETURNED_TO_LOBBY";
  data: LobbyState;
}
export interface UpdateSettingsData {
  total_rounds: number;
  bluff_time: number;
  vote_time: number;
  max_players: number;
  language: GameLanguage;
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
export interface ReturnToLobbyMessage {
  event: "RETURN_TO_LOBBY";
  data: Record<string, never>;
}
export interface LeaveRoomMessage {
  event: "LEAVE_ROOM";
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
  language: GameLanguage;
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
export interface SubmitBluffData {
  bluff_answer: string;
}
export interface SubmitBluffMessage {
  event: "SUBMIT_BLUFF";
  data: SubmitBluffData;
}
export interface BluffSubmittedMessage {
  event: "BLUFF_SUBMITTED";
  data: { player_id: string };
}
export interface VotingPhaseData {
  round: number;
  total_rounds: number;
  duration: number;
  question: { text: string; image_url: string | null };
  choices: Array<{ id: string; text: string }>;
}
export interface VotingPhaseMessage {
  event: "PHASE_VOTING";
  data: VotingPhaseData;
}
export interface SubmitVoteMessage {
  event: "SUBMIT_VOTE";
  data: { choice_id: string };
}
export interface VoteSubmittedMessage {
  event: "VOTE_SUBMITTED";
  data: { player_id: string };
}
export interface ResultsLeaderboardEntry {
  player_id: string;
  username: string;
  score: number;
  round_points: number;
  rank: number;
  rank_change: number;
  avatar_url: string | null;
}
export interface ResultsRevealedData {
  round: number;
  total_rounds: number;
  choices: Array<{
    id: string;
    text: string;
    authors_names: string[] | null;
    voters: string[];
    is_correct: boolean;
  }>;
  leaderboard: ResultsLeaderboardEntry[];
}
export interface ResultsRevealedMessage {
  event: "RESULTS_REVEALED";
  data: ResultsRevealedData;
}
export interface PodiumPhaseData {
  round: number;
  total_rounds: number;
  leaderboard: ResultsLeaderboardEntry[];
}
export interface PodiumPhaseMessage {
  event: "PHASE_PODIUM";
  data: PodiumPhaseData;
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
  | ReturnedToLobbyMessage
  | ChatMessageEvent
  | CategoryPhaseMessage
  | QuestionPhaseMessage
  | BluffSubmittedMessage
  | VotingPhaseMessage
  | VoteSubmittedMessage
  | ResultsRevealedMessage
  | PodiumPhaseMessage
  | ServerErrorMessage;
