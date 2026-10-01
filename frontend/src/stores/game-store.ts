import type { GameConnectionState, LobbyState, ServerErrorData } from "@/lib/websocket/websocket-types";
export interface GameStoreState { connectionState: GameConnectionState; lobby: LobbyState | null; error: ServerErrorData | null; }
export const initialGameStoreState: GameStoreState = { connectionState: "DISCONNECTED", lobby: null, error: null };
export function createGameStore() {
  let state = initialGameStoreState;
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
    setConnectionState(connectionState: GameConnectionState) { state = { ...state, connectionState }; publish(); },
    setLobby(lobby: LobbyState) { state = { ...state, lobby, error: null }; publish(); },
    setError(error: ServerErrorData) { state = { ...state, error }; publish(); },
    reset() { state = initialGameStoreState; publish(); },
  };
}
