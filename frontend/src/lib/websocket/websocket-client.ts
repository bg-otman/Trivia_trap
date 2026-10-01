import { parseLobbyMessage } from "./websocket-events";
import { getSessionUser } from "./session-user";
import type {
  GameConnectionState,
  LobbyServerMessage,
} from "./websocket-types";
interface Handlers {
  onStateChange: (state: GameConnectionState) => void;
  onMessage: (message: LobbyServerMessage) => void;
  onMalformedMessage: () => void;
}
const log = (message: string) => {
  if (process.env.NODE_ENV === "development") console.info(`[WS] ${message}`);
};
export class GameWebSocketClient {
  private socket: WebSocket | null = null;
  private roomId: string | null = null;
  private generation = 0;
  constructor(private readonly handlers: Handlers) { }
  connect(roomId: string) {
    if (
      !roomId ||
      (this.roomId === roomId &&
        this.socket &&
        this.socket.readyState < WebSocket.CLOSING)
    )
      return;
    this.disconnect();
    const generation = ++this.generation;
    this.roomId = roomId;
    this.handlers.onStateChange("CONNECTING");
    log("Connecting..."); 
    const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:8000";
    const sessionUser = getSessionUser();
    const url = new URL(
      `${baseUrl.replace(/\/$/, "")}/room/${encodeURIComponent(roomId)}`,
    );
    url.searchParams.set("user_id", sessionUser.id);
    url.searchParams.set("user_name", sessionUser.name);
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.onopen = () => {
      if (generation === this.generation) {
        log("Connected");
        this.handlers.onStateChange("CONNECTED");
      }
    };
    socket.onmessage = (event) => {
      if (generation !== this.generation || typeof event.data !== "string")
        return;
      const message = parseLobbyMessage(event.data);
      if (!message) {
        log("Ignored malformed message");
        this.handlers.onMalformedMessage();
        return;
      }
      if (message.event === "LOBBY_UPDATE") log("Received LOBBY_UPDATE");
      this.handlers.onMessage(message);
    };
    socket.onerror = () => {
      if (generation === this.generation) {
        log("Error");
        this.handlers.onStateChange("ERROR");
      }
    };
    socket.onclose = () => {
      if (generation === this.generation) {
        log("Disconnected");
        this.socket = null;
        this.handlers.onStateChange("DISCONNECTED");
      }
    };
  }
  disconnect() {
    this.generation += 1;
    this.roomId = null;
    if (!this.socket) return;
    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onclose = null;
    this.socket.close(1000, "Lobby closed");
    this.socket = null;
  }
}
