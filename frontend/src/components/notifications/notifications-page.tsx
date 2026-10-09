"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, LoaderCircle, RefreshCw, UserPlus, X } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, apiMediaUrl } from "@/lib/api";
import type { FriendRequestNotification } from "@/types/notifications";

async function responseError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") return body.detail;
  return "Something went wrong. Please try again.";
}

export function NotificationsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FriendRequestNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/friends/requests");
      if (response.status === 401 || response.status === 403) {
        router.replace(`/login?next=${encodeURIComponent("/notifications")}`);
        return;
      }
      if (!response.ok) throw new Error(await responseError(response));
      setRequests(await response.json() as FriendRequestNotification[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNotifications(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  async function respond(request: FriendRequestNotification, action: "accept" | "reject") {
    if (busyId) return;
    setBusyId(request.id);
    setActionError("");
    try {
      const response = await apiFetch(`/friends/${action}/${encodeURIComponent(request.id)}`, { method: "POST" });
      if (response.status === 401 || response.status === 403) {
        router.replace(`/login?next=${encodeURIComponent("/notifications")}`);
        return;
      }
      if (!response.ok) throw new Error(await responseError(response));
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } catch (actionFailure) {
      setActionError(actionFailure instanceof Error ? actionFailure.message : "Could not update this request.");
      await loadNotifications(true);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Inbox</p>
          <h1 className="mt-2 font-secondary text-3xl uppercase text-white sm:text-4xl">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">Stay updated on what&apos;s happening in Trivia Trap.</p>
        </div>
        <Button type="button" variant="surface" size="sm" disabled={loading || refreshing} onClick={() => { void loadNotifications(true); }}>
          {refreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh
        </Button>
      </header>

      {actionError ? <p role="alert" className="rounded-xl border border-trap-danger/25 bg-trap-danger/10 px-4 py-3 text-sm text-trap-danger">{actionError}</p> : null}
      {error ? <ErrorState title="Notifications unavailable" description={error} actionLabel="Try again" onAction={() => { void loadNotifications(); }} /> : null}

      {loading ? (
        <div className="space-y-3" aria-label="Loading notifications">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[20px]" />)}
        </div>
      ) : !error && requests.length === 0 ? (
        <Card className="border-white/[0.07] bg-trap-surface">
          <EmptyState icon={Bell} title="You’re all caught up." description="New updates will appear here." className="py-16" />
        </Card>
      ) : !error ? (
        <section aria-label="Notifications" className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id} className="border-secondary/20 bg-trap-surface shadow-[0_14px_34px_rgba(0,0,0,0.14)]">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="relative shrink-0">
                    <PlayerAvatar name={request.username} src={apiMediaUrl(request.avatar_url)} size={48} animated />
                    <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-trap-surface bg-secondary text-white"><UserPlus className="size-3" /></span>
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/users/${encodeURIComponent(request.username)}`} className="truncate text-sm font-extrabold text-white hover:text-primary">{request.username}</Link>
                      <span className="rounded-full bg-secondary/15 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#9295ff]">Friend request</span>
                    </div>
                    <p className="mt-1 text-xs text-[#a6a6ae]">Wants to add you as a friend.</p>
                    <time dateTime={request.created_at} className="mt-1 block text-[10px] text-[#777782]">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.created_at))}</time>
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <Button type="button" size="sm" disabled={busyId !== null} onClick={() => { void respond(request, "accept"); }}><Check className="size-4" /> Accept</Button>
                  <Button type="button" variant="surface" size="sm" disabled={busyId !== null} onClick={() => { void respond(request, "reject"); }}>{busyId === request.id ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />} Decline</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
