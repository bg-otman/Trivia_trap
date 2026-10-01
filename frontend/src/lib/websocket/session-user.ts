export interface SessionUser {
  id: string;
  name: string;
}

const storageKey = "trivia-trap:guest-user";

function createSessionUser(): SessionUser {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return {
    id: `guest_${crypto.randomUUID()}`,
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
