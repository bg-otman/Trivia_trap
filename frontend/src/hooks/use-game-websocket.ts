"use client";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { GameWebSocketClient } from "@/lib/websocket/websocket-client";
import { createUuid, type SessionUser } from "@/lib/websocket/session-user";
import { createGameStore, initialGameStoreState } from "@/stores/game-store";
export function useGameWebSocket(roomId: string | undefined, sessionUser: SessionUser) {
  const store = useMemo(() => createGameStore(), []);
  const disconnectTimer = useRef<number | null>(null);
  const client = useMemo(() => new GameWebSocketClient({
    onStateChange: store.setConnectionState,
    onMessage: (message) => {
      if (message.event === "LOBBY_UPDATE") {
        store.setLobby(message.data);
      } else if (message.event === "RETURNED_TO_LOBBY") {
        store.setLobby(message.data);
        store.returnToLobby();
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
        store.confirmBluffSubmitted(message.data.player_id, sessionUser?.id);
      } else if (message.event === "PHASE_VOTING") {
        store.setVotingPhase(message.data);
      } else if (message.event === "VOTE_SUBMITTED") {
        store.confirmVoteSubmitted(message.data.player_id, sessionUser?.id);
      } else if (message.event === "RESULTS_REVEALED") {
        store.setResultsRevealed(message.data);
      } else if (message.event === "PHASE_PODIUM") {
        store.setPodiumPhase(message.data);
      } else {
        if (message.data.code === "BLUFF_REJECTED") {
          store.clearCurrentBluffSubmission();
        }
        if (["VOTE_REJECTED", "NOT_IN_ROOM", "INVALID_CHOICE", "SELF_VOTE"].includes(message.data.code)) {
          store.setVoteSubmitted(null, false);
        }
        store.setError(message.data);
      }
    },
    onMalformedMessage: () => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[WS] Ignored malformed server event.");
      }
    },
  }, sessionUser), [store, sessionUser]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, () => initialGameStoreState);
  const updateSettings = useMemo(() => client.updateSettings.bind(client), [client]);
  const sendChatMessage = useMemo(() => client.sendChatMessage.bind(client), [client]);
  const kickPlayer = useMemo(() => client.kickPlayer.bind(client), [client]);
  const leaveRoom = useMemo(() => () => {
    // The server notification is best-effort: a disconnected player must still
    // be able to clear local room state and leave the screen.
    client.leaveRoom();
    client.disconnect();
    store.reset();
  }, [client, store]);
  const nextPhase = useMemo(() => client.nextPhase.bind(client), [client]);
  const returnToLobby = useMemo(() => client.returnToLobby.bind(client), [client]);
  const getQuestion = useMemo(() => client.getQuestion.bind(client), [client]);
  const submitBluff = useMemo(() => (answer: string) => {
    if (store.getSnapshot().bluffSubmitted) return false;
    return client.submitBluff(answer);
  }, [client, store]);
  const submitVote = useMemo(() => (choiceId: string) => {
    if (store.getSnapshot().voteSubmitted) return false;
    const sent = client.submitVote(choiceId);
    if (sent) store.setVoteSubmitted(choiceId, false);
    return sent;
  }, [client, store]);
  const showResults = useMemo(() => () => {
    const sent = client.nextPhase();
    if (sent) store.showRoundResults();
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
    leaveRoom,
    nextPhase,
    getQuestion,
    submitBluff,
    submitVote,
    showResults,
    returnToLobby,
    setBluffAnswer: store.setBluffAnswer,
    clearError: store.clearError,
    reconnect: () => {
      if (roomId) {
        client.disconnect();
        store.clearTransientActivity();
        client.connect(roomId);
      }
    },
  };
}
