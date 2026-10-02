import type {
  CategoryPhaseData,
  GameConnectionState,
  LobbyState,
  ServerErrorData,
} from "@/lib/websocket/websocket-types";
import type { ChatMessageData } from "@/types/chat";
export interface GameStoreState {
  connectionState: GameConnectionState;
  lobby: LobbyState | null;
  phase: "CATEGORY" | null;
  categoryPhase: CategoryPhaseData | null;
  chatMessages: ChatMessageData[];
  error: ServerErrorData | null;
}
export const initialGameStoreState: GameStoreState = {
  connectionState: "DISCONNECTED",
  lobby: null,
  phase: null,
  categoryPhase: null,
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
      state = { ...state, phase: "CATEGORY", categoryPhase, error: null };
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
