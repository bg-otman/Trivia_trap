"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, LoaderCircle, RefreshCw, Send, Share2, UserPlus, Users } from "lucide-react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiFetch, apiMediaUrl } from "@/lib/api";

type Feedback = "code" | "link" | "shared" | "error" | null;
type Friend = { id: string; username: string; avatar_url: string | null; is_online: boolean };

async function responseError(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  return body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
    ? body.detail : "Could not send the invitation.";
}

export function InviteFriendsDialog({ roomCode, inviteUrl, playerIds, roomFull }: {
  roomCode: string; inviteUrl: string; playerIds: string[]; roomFull: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const sortedFriends = useMemo(() => [...friends].sort((a, b) =>
    Number(b.is_online) - Number(a.is_online) || a.username.localeCompare(b.username)), [friends]);
  const onlineCount = friends.filter((friend) => friend.is_online).length;

  const loadFriends = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await apiFetch("/friends/");
      if (!response.ok) throw new Error(await responseError(response));
      setFriends(await response.json() as Friend[]);
      setLoadError("");
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Could not load friends."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => { void loadFriends(); }, 0);
    const interval = window.setInterval(() => { void loadFriends(true); }, 15_000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); };
  }, [loadFriends, open]);

  function showFeedback(next: Feedback) {
    setFeedback(next);
    window.setTimeout(() => setFeedback((current) => current === next ? null : current), 1800);
  }
  async function copy(value: string, kind: "code" | "link") {
    try { await navigator.clipboard.writeText(value); showFeedback(kind); } catch { showFeedback("error"); }
  }
  async function share() {
    if (!navigator.share) { await copy(inviteUrl, "link"); return; }
    try {
      await navigator.share({ title: "Join my Trivia Trap room", text: `Join my room with code ${roomCode}.`, url: inviteUrl });
      showFeedback("shared");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) showFeedback("error");
    }
  }
  async function invite(friend: Friend) {
    setBusyId(friend.id); setActionError("");
    try {
      const response = await apiFetch("/invitations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: Number(friend.id), room_code: roomCode }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setInvitedIds((current) => new Set(current).add(friend.id));
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not send the invitation."); }
    finally { setBusyId(null); }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setFeedback(null); setActionError(""); } }}>
      <DialogTrigger asChild><Button type="button" variant="secondary" className="w-full"><UserPlus className="size-4" /> Invite friends</Button></DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto p-5 sm:p-7">
        <DialogHeader><DialogTitle className="font-secondary text-xl uppercase">Invite friends</DialogTitle><DialogDescription>Invite an online friend or share room <strong className="text-accent">{roomCode}</strong>.</DialogDescription></DialogHeader>
        <section className="mt-5" aria-labelledby="online-friends-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h3 id="online-friends-title" className="text-sm font-extrabold text-white">Friends</h3><p className="text-[10px] text-[#85858f]">{onlineCount} online</p></div>
            <Button type="button" variant="ghost" size="icon-sm" disabled={loading || refreshing} onClick={() => { void loadFriends(true); }} aria-label="Refresh friends"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} /></Button>
          </div>
          {loading ? <div className="grid h-28 place-items-center rounded-2xl bg-white/[0.035]"><LoaderCircle className="size-5 animate-spin text-secondary" /></div> : null}
          {!loading && loadError ? <p role="alert" className="rounded-xl bg-trap-danger/10 p-3 text-xs text-trap-danger">{loadError}</p> : null}
          {!loading && !loadError && onlineCount === 0 ? <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center"><Users className="mx-auto size-5 text-[#777782]" /><p className="mt-2 text-xs font-bold text-white">No friends are online</p><p className="mt-1 text-[10px] text-[#85858f]">You can still share the link below.</p></div> : null}
          {!loading && !loadError && sortedFriends.length > 0 ? <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {sortedFriends.map((friend) => {
              const joined = playerIds.includes(friend.id); const sent = invitedIds.has(friend.id);
              const disabled = !friend.is_online || joined || sent || roomFull || busyId !== null;
              const label = roomFull ? "Room full" : joined ? "Joined" : sent ? "Sent" : friend.is_online ? "Invite" : "Offline";
              return <div key={friend.id} className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-2.5">
                <span className="relative"><PlayerAvatar name={friend.username} src={apiMediaUrl(friend.avatar_url)} size={40} /><span className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-[#232329] ${friend.is_online ? "bg-trap-success" : "bg-[#62626b]"}`} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-white">{friend.username}</p><p className={`text-[10px] ${friend.is_online ? "text-trap-success" : "text-[#777782]"}`}>{friend.is_online ? "Online" : "Offline"}</p></div>
                <Button type="button" size="sm" variant={sent ? "surface" : "secondary"} disabled={disabled} onClick={() => { void invite(friend); }}>{busyId === friend.id ? <LoaderCircle className="size-3.5 animate-spin" /> : sent ? <Check className="size-3.5" /> : <Send className="size-3.5" />} {label}</Button>
              </div>;
            })}
          </div> : null}
          {actionError ? <p role="alert" className="mt-2 text-xs text-trap-danger">{actionError}</p> : null}
        </section>
        <div className="my-5 h-px bg-white/[0.07]" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="surface" size="sm" onClick={() => { void copy(roomCode, "code"); }}>{feedback === "code" ? <Check className="size-4 text-trap-success" /> : <Copy className="size-4" />} Code</Button>
          <Button type="button" variant="surface" size="sm" onClick={() => { void copy(inviteUrl, "link"); }}>{feedback === "link" ? <Check className="size-4 text-trap-success" /> : <Link2 className="size-4" />} Link</Button>
          <Button type="button" size="sm" onClick={() => { void share(); }}>{feedback === "shared" ? <Check className="size-4" /> : <Share2 className="size-4" />} Share</Button>
        </div>
        <p role="status" aria-live="polite" className={`mt-3 min-h-4 text-center text-[10px] ${feedback === "error" ? "text-trap-danger" : "text-[#777782]"}`}>{feedback === "error" ? "Sharing failed. Copy the room code manually." : feedback === "code" ? "Room code copied." : feedback === "link" ? "Invite link copied." : feedback === "shared" ? "Invitation shared." : "Invitations expire after two hours."}</p>
      </DialogContent>
    </Dialog>
  );
}
