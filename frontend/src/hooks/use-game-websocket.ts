"use client";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { GameWebSocketClient } from "@/lib/websocket/websocket-client";
import { getSessionUser } from "@/lib/websocket/session-user";
import { createGameStore, initialGameStoreState } from "@/stores/game-store";
export function useGameWebSocket(roomId?: string) {
  const store = useMemo(() => createGameStore(), []);
  const disconnectTimer = useRef<number | null>(null);
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
    if (disconnectTimer.current !== null) {
      window.clearTimeout(disconnectTimer.current);
      disconnectTimer.current = null;
    }
    client.connect(roomId);
    return () => {
      // React Strict Mode immediately re-runs effects in development. Deferring
      // cleanup lets that second setup retain the in-flight connection.
      disconnectTimer.current = window.setTimeout(() => {
        client.disconnect();
        store.reset();
        disconnectTimer.current = null;
      }, 0);
    };
  }, [client, roomId, store]);
  return { ...state, sessionUser, reconnect: () => { if (roomId) { client.disconnect(); client.connect(roomId); } } };
}
