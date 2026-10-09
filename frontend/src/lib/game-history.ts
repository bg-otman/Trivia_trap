import { cookies } from "next/headers";
import type { GameHistoryResponse, HistoryFilter } from "@/types/history";
import { UserApiError } from "@/lib/getUser";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function getGameHistory({
  limit = 10,
  offset = 0,
  result = "all",
}: {
  limit?: number;
  offset?: number;
  result?: HistoryFilter;
} = {}): Promise<GameHistoryResponse> {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) throw new UserApiError("Not authenticated", 401);

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    result,
  });
  const response = await fetch(`${apiBase}/users/me/history?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const body = await response.json() as GameHistoryResponse | { detail?: string };
  if (!response.ok) {
    throw new UserApiError("detail" in body && body.detail ? body.detail : "Could not load game history.", response.status);
  }
  return body as GameHistoryResponse;
}
