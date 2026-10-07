const isLoopback = (hostname: string) => hostname === "localhost" || hostname === "127.0.0.1";

function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  const browserHost = typeof window === "undefined" ? undefined : window.location.hostname;

  // A login cookie belongs to a hostname, even when frontend and API use different ports.
  if (browserHost && isLoopback(browserHost)) {
    if (!configured) return `http://${browserHost}:8000`;
    const url = new URL(configured);
    if (isLoopback(url.hostname)) {
      url.hostname = browserHost;
      return url.toString().replace(/\/$/, "");
    }
  }

  return (configured ?? "http://localhost:8000").replace(/\/$/, "");
}

/** Browser requests include the HttpOnly login cookie automatically. */
export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API paths must start with a single slash.");
  }

  return fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    credentials: "include",
  });
}
