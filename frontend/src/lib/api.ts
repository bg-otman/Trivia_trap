const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");
const accessTokenKey = "access_token";
const accessTokenCookie = "access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(accessTokenKey);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(accessTokenKey, token);
  document.cookie = `${accessTokenCookie}=${encodeURIComponent(token)}; Path=/; Max-Age=1800; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(accessTokenKey);
    document.cookie = `${accessTokenCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) clearAccessToken();

  return response;
}