import type { ServerErrorData } from "@/lib/websocket/websocket-types";

export interface GameErrorPresentation {
  title: string;
  message: string;
}

const knownErrors: Record<string, GameErrorPresentation> = {
  GAME_IN_PROGRESS: {
    title: "GAME IN PROGRESS",
    message: "This game is already in progress. You cannot join right now.",
  },
  ROOM_NOT_FOUND: {
    title: "ROOM NOT FOUND",
    message: "This room could not be found. Check the room code and try again.",
  },
  FULL_ROOM: {
    title: "ROOM FULL",
    message: "This room is full. Try joining another room.",
  },
  INVALID_ROOM_CODE: {
    title: "INVALID ROOM CODE",
    message: "The room code is invalid. Please check it and try again.",
  },
  FORBIDDEN: {
    title: "ACTION NOT ALLOWED",
    message: "You cannot perform this action right now.",
  },
  PLAYER_NOT_FOUND: {
    title: "PLAYER NOT FOUND",
    message: "Your player could not be found in this room. Rejoin and try again.",
  },
  INVALID_PHASE: {
    title: "ACTION NOT AVAILABLE",
    message: "That action is not available during this part of the game.",
  },
  INVALID_PAYLOAD: {
    title: "INVALID REQUEST",
    message: "The game could not process that request. Please try again.",
  },
  BLUFF_REJECTED: {
    title: "ANSWER NOT ACCEPTED",
    message: "That answer cannot be used. Try a different bluff.",
  },
  ERROR: {
    title: "SOMETHING WENT WRONG",
    message: "Something went wrong. Please try again.",
  },
};

export function gameErrorPresentation(
  error: Pick<ServerErrorData, "code" | "message">,
): GameErrorPresentation {
  const known = knownErrors[error.code];
  if (known) return known;
  const message = error.message.trim();
  return {
    title: "GAME ERROR",
    message: message || "Something went wrong. Please try again.",
  };
}

export const connectionErrorPresentation: GameErrorPresentation = {
  title: "CONNECTION LOST",
  message: "Unable to connect to the game server. Check your connection and try again.",
};
