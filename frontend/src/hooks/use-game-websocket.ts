"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GameWebSocketClient } from "@/lib/websocket/websocket-client";
import { getSessionUser } from "@/lib/websocket/session-user";
import { createGameStore, initialGameStoreState } from "@/stores/game-store";
export function useGameWebSocket(roomId?: string) {
  const store = useMemo(() => createGameStore(), []);
  const sessionUser = useMemo(
    () => typeof window === "undefined" ? null : getSessionUser(),
    [],
  );
  const client = useMemo(() => new GameWebSocketClient({
    onStateChange: store.setConnectionState,
    onMessage: (message) => message.event === "LOBBY_UPDATE" ? store.setLobby(message.data) : store.setError(message.data),
    onMalformedMessage: () => { store.setError({ code: "INVALID_PAYLOAD", message: "The server sent an invalid lobby update." }); store.setConnectionState("ERROR"); },
  }), [store]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, () => initialGameStoreState);
  useEffect(() => {
    if (!roomId) return;
    client.connect(roomId);
    return () => { client.disconnect(); store.reset(); };
  }, [client, roomId, store]);
  return { ...state, sessionUser, reconnect: () => { if (roomId) { client.disconnect(); client.connect(roomId); } } };
}
