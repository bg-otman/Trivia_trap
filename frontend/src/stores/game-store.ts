import type {
  CategoryPhaseData,
  GameConnectionState,
  LobbyState,
  QuestionPhaseData,
  ResultsRevealedData,
  ServerErrorData,
  VotingPhaseData,
} from "@/lib/websocket/websocket-types";
import type { ChatMessageData } from "@/types/chat";
export interface GameStoreState {
  connectionState: GameConnectionState;
  lobby: LobbyState | null;
  phase: "CATEGORY" | "TRAP" | "VOTING" | "RESULTS_REVEAL" | null;
  categoryPhase: CategoryPhaseData | null;
  questionPhase: QuestionPhaseData | null;
  bluffAnswer: string;
  bluffSubmitted: boolean;
  votingPhase: VotingPhaseData | null;
  selectedVote: string | null;
  voteSubmitted: boolean;
  resultsRevealed: ResultsRevealedData | null;
  chatMessages: ChatMessageData[];
  error: ServerErrorData | null;
}
export const initialGameStoreState: GameStoreState = {
  connectionState: "DISCONNECTED",
  lobby: null,
  phase: null,
  categoryPhase: null,
  questionPhase: null,
  bluffAnswer: "",
  bluffSubmitted: false,
  votingPhase: null,
  selectedVote: null,
  voteSubmitted: false,
  resultsRevealed: null,
  chatMessages: [],
  error: null,
};
export function createGameStore() {
  let state = initialGameStoreState;
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setConnectionState(connectionState: GameConnectionState) {
      state = { ...state, connectionState };
      publish();
    },
    setLobby(lobby: LobbyState) {
      state = { ...state, lobby, error: null };
      publish();
    },
    addChatMessage(message: ChatMessageData) {
      state = { ...state, chatMessages: [...state.chatMessages, message] };
      publish();
    },
    setCategoryPhase(categoryPhase: CategoryPhaseData) {
      state = {
        ...state,
        phase: "CATEGORY",
        categoryPhase,
        questionPhase: null,
        votingPhase: null,
        bluffAnswer: "",
        bluffSubmitted: false,
        selectedVote: null,
        voteSubmitted: false,
        resultsRevealed: null,
        error: null,
      };
      publish();
    },
    setQuestionPhase(questionPhase: QuestionPhaseData) {
      state = {
        ...state,
        phase: "TRAP",
        questionPhase,
        votingPhase: null,
        bluffAnswer: "",
        bluffSubmitted: false,
        error: null,
      };
      publish();
    },
    setBluffAnswer(bluffAnswer: string) {
      state = { ...state, bluffAnswer };
      publish();
    },
    setBluffSubmitted(bluffSubmitted: boolean) {
      state = { ...state, bluffSubmitted };
      publish();
    },
    setVotingPhase(votingPhase: VotingPhaseData) {
      state = {
        ...state,
        phase: "VOTING",
        votingPhase,
        selectedVote: null,
        voteSubmitted: false,
        error: null,
      };
      publish();
    },
    setVoteSubmitted(selectedVote: string | null, voteSubmitted: boolean) {
      state = { ...state, selectedVote, voteSubmitted };
      publish();
    },
    setResultsRevealed(resultsRevealed: ResultsRevealedData) {
      state = {
        ...state,
        phase: "RESULTS_REVEAL",
        resultsRevealed,
        error: null,
      };
      publish();
    },
    setError(error: ServerErrorData) {
      state = { ...state, error };
      publish();
    },
    clearError() {
      if (!state.error) return;
      state = { ...state, error: null };
      publish();
    },
    reset() {
      state = initialGameStoreState;
      publish();
    },
  };
}
