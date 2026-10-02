import type { LobbyServerMessage, LobbyState, ServerErrorData } from "./websocket-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseLobbyMessage(raw: string): LobbyServerMessage | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(value) || !isString(value.event) || !isRecord(value.data)) return null;

  if (value.event === "ERROR") {
    const data = value.data;
    if (!isString(data.code) || !isString(data.message)) return null;
    return { event: "ERROR", data: data as unknown as ServerErrorData };
  }

  if (value.event === "CHAT_MESSAGE") {
    const data = value.data;
    if (!isRecord(data.player) || !isString(data.player.id) ||
        !isString(data.player.username) || !isString(data.message)) return null;
    const avatarUrl = data.player.avatar_url;
    if (avatarUrl !== undefined && avatarUrl !== null && !isString(avatarUrl)) return null;
    return {
      event: "CHAT_MESSAGE",
      data: {
        player: {
          id: data.player.id,
          username: data.player.username,
          avatar_url: avatarUrl,
        },
        message: data.message,
      },
    };
  }

  if (value.event === "PHASE_CATEGORY") {
    return { event: "PHASE_CATEGORY", data: value.data };
  }

  if (value.event !== "LOBBY_UPDATE") return null;
  const data = value.data;
  if (!isNumber(data.round) || !isString(data.host_id) || !Array.isArray(data.players) || !isRecord(data.settings)) return null;

  const players = data.players.map((player) => {
    if (!isRecord(player)) return null;
    // The published contract uses `id`; the backend currently emits `player_id`.
    const id = isString(player.id) ? player.id : player.player_id;
    if (!isString(id) || !isString(player.username) || typeof player.is_present !== "boolean" || !isNumber(player.score)) return null;
    return { id, username: player.username, is_present: player.is_present, score: player.score };
  });
  if (players.some((player) => player === null)) return null;

  const settings = data.settings;
  if (
    !isNumber(settings.total_rounds) ||
    !isNumber(settings.bluff_time) ||
    !isNumber(settings.vote_time) ||
    !isNumber(settings.max_players)
  ) return null;

  return {
    event: "LOBBY_UPDATE",
    data: {
      round: data.round,
      host_id: data.host_id,
      players: players as LobbyState["players"],
      settings: {
        total_rounds: settings.total_rounds,
        bluff_time: settings.bluff_time,
        vote_time: settings.vote_time,
        max_players: settings.max_players,
        language: isString(settings.language) ? settings.language : "en",
      },
    },
  };

}
