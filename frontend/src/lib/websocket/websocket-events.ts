import type { CategoryPhaseData, LobbyServerMessage, LobbyState, QuestionPhaseData, ServerErrorData, VotingPhaseData } from "./websocket-types";

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
    const data = value.data;
    if (!isNumber(data.round) || !isNumber(data.total_rounds) ||
        !isNumber(data.duration) || !Array.isArray(data.categories)) return null;
    const categories = data.categories.map((category) => {
      if (!isRecord(category) || !isNumber(category.id) || !isString(category.name)) return null;
      const imageUrl = category.image_url;
      if (imageUrl !== undefined && imageUrl !== null && !isString(imageUrl)) return null;
      return { id: category.id, name: category.name, image_url: imageUrl ?? null };
    });
    if (categories.some((category) => category === null)) return null;
    return {
      event: "PHASE_CATEGORY",
      data: { ...data, categories } as CategoryPhaseData,
    };
  }

  if (value.event === "PHASE_QUESTION") {
    const data = value.data;
    if (!isString(data.category) || !isString(data.question) ||
        !isNumber(data.question_id) || !isNumber(data.duration) ||
        !isNumber(data.round) || !isNumber(data.total_rounds)) return null;
    const imageUrl = data.image_url;
    if (imageUrl !== undefined && imageUrl !== null && !isString(imageUrl)) return null;
    return {
      event: "PHASE_QUESTION",
      data: { ...data, image_url: imageUrl ?? null } as QuestionPhaseData,
    };
  }

  if (value.event === "BLUFF_SUBMITTED") {
    const data = value.data;
    if (!isString(data.player_id)) return null;
    return { event: "BLUFF_SUBMITTED", data: { player_id: data.player_id } };
  }

  if (value.event === "PHASE_VOTING") {
    const data = value.data;
    if (!isNumber(data.round) || !isNumber(data.total_rounds) ||
        !isNumber(data.duration) || !isRecord(data.question) ||
        !isString(data.question.text) || !Array.isArray(data.choices)) return null;
    const imageUrl = data.question.image_url;
    if (imageUrl !== undefined && imageUrl !== null && !isString(imageUrl)) return null;
    const choices = data.choices.map((choice) => {
      if (!isRecord(choice) || !isString(choice.id) || !isString(choice.text)) return null;
      return { id: choice.id, text: choice.text };
    });
    if (choices.some((choice) => choice === null)) return null;
    return {
      event: "PHASE_VOTING",
      data: {
        round: data.round,
        total_rounds: data.total_rounds,
        duration: data.duration,
        question: { text: data.question.text, image_url: imageUrl ?? null },
        choices,
      } as VotingPhaseData,
    };
  }

  if (value.event === "VOTE_SUBMITTED") {
    const data = value.data;
    if (!isString(data.player_id)) return null;
    return { event: "VOTE_SUBMITTED", data: { player_id: data.player_id } };
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
