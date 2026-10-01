export interface SessionUser {
  id: string;
  name: string;
}

const storageKey = "trivia-trap:guest-user";

function createUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function createSessionUser(): SessionUser {
  const suffix = createUuid().replaceAll("-", "").slice(0, 6).toUpperCase();
  return {
    id: `guest_${createUuid()}`,
    name: `Guest-${suffix}`,
  };
}

export function getSessionUser(): SessionUser {
  const stored = window.sessionStorage.getItem(storageKey);
  if (stored) {
    try {
      const user = JSON.parse(stored) as Partial<SessionUser>;
      if (typeof user.id === "string" && typeof user.name === "string") {
        return { id: user.id, name: user.name };
      }
    } catch {
      // Replace invalid session data with a fresh per-tab guest below.
    }
  }

  const user = createSessionUser();
  window.sessionStorage.setItem(storageKey, JSON.stringify(user));
  return user;
}
