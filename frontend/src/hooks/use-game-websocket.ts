"use client";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { GameWebSocketClient } from "@/lib/websocket/websocket-client";
import { createUuid, getSessionUser } from "@/lib/websocket/session-user";
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
    onMessage: (message) => {
      if (message.event === "LOBBY_UPDATE") {
        store.setLobby(message.data);
      } else if (message.event === "CHAT_MESSAGE") {
        store.addChatMessage({
          id: createUuid(),
          playerId: message.data.player.id,
          playerName: message.data.player.username,
          playerAvatar: message.data.player.avatar_url ?? undefined,
          text: message.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isYou: message.data.player.id === sessionUser?.id,
        });
      } else if (message.event === "PHASE_CATEGORY") {
        store.setCategoryPhase(message.data);
      } else if (message.event === "PHASE_QUESTION") {
        store.setQuestionPhase(message.data);
      } else if (message.event === "BLUFF_SUBMITTED") {
        if (message.data.player_id === sessionUser?.id) {
          store.setBluffSubmitted(true);
        }
      } else {
        if (message.data.code === "BLUFF_REJECTED") {
          store.setBluffSubmitted(false);
        }
        store.setError(message.data);
      }
    },
    onMalformedMessage: () => { store.setError({ code: "INVALID_PAYLOAD", message: "The server sent an invalid lobby update." }); store.setConnectionState("ERROR"); },
  }), [store, sessionUser?.id]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, () => initialGameStoreState);
  const updateSettings = useMemo(() => client.updateSettings.bind(client), [client]);
  const sendChatMessage = useMemo(() => client.sendChatMessage.bind(client), [client]);
  const kickPlayer = useMemo(() => client.kickPlayer.bind(client), [client]);
  const nextPhase = useMemo(() => client.nextPhase.bind(client), [client]);
  const getQuestion = useMemo(() => client.getQuestion.bind(client), [client]);
  const submitBluff = useMemo(() => (answer: string) => {
    const sent = client.submitBluff(answer);
    if (sent) store.setBluffSubmitted(true);
    return sent;
  }, [client, store]);
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
  return {
    ...state,
    sessionUser,
    updateSettings,
    sendChatMessage,
    kickPlayer,
    nextPhase,
    getQuestion,
    submitBluff,
    setBluffAnswer: store.setBluffAnswer,
    clearError: store.clearError,
    reconnect: () => { if (roomId) { client.disconnect(); client.connect(roomId); } },
  };
}
