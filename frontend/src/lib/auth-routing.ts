const fallbackPath = "/dashboard";

/**
 * Accept only same-application paths. In particular, reject protocol-relative
 * URLs and backslash variants that browsers may interpret as external URLs.
 */
export function safeReturnPath(value: string | null | undefined, fallback = fallbackPath) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "http://trivia-trap.local");
    if (url.origin !== "http://trivia-trap.local") return fallback;
    // Encoded slashes/backslashes can be decoded by an intermediary and turn
    // an apparently local path into a protocol-relative destination.
    if (/%(?:2f|5c)/i.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function loginPathFor(destination: string) {
  return `/login?next=${encodeURIComponent(safeReturnPath(destination))}`;
}
