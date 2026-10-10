import { apiFetch } from "@/lib/api";

export async function logoutSession(): Promise<void> {
  await apiFetch("/users/me/presence", { method: "DELETE" }).catch(() => undefined);
  const response = await apiFetch("/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Could not log out. Please try again.");
}
