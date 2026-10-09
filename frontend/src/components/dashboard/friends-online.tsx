"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { apiFetch, apiMediaUrl } from "@/lib/api";

type Friend = { id: string; username: string; avatar_url: string | null; is_online: boolean };

export function FriendsOnline() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/friends/", { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<Friend[]> : [])
      .then((data) => { if (!controller.signal.aborted) setFriends(data.sort((a, b) => Number(b.is_online) - Number(a.is_online))); })
      .catch(() => { /* The friends page provides the full error and sign-in states. */ })
      .finally(() => { if (!controller.signal.aborted) setLoaded(true); });
    return () => controller.abort();
  }, []);

  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-trap-success">Your crew</p>
          <CardTitle className="mt-1 font-secondary text-lg uppercase">Friends</CardTitle>
        </div>
        <Users className="size-5 text-[#9295ff]" aria-hidden="true" />
      </CardHeader>
      <CardContent className="px-0">
        {friends.length ? (
          <div className="divide-y divide-white/[0.055]">
            {friends.slice(0, 4).map((friend) => (
              <Link key={friend.id} href={`/users/${encodeURIComponent(friend.username)}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.025]">
                <span className="relative shrink-0">
                  <PlayerAvatar name={friend.username} src={apiMediaUrl(friend.avatar_url)} size={40} animated />
                  <span className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-trap-surface ${friend.is_online ? "bg-trap-success" : "bg-[#62626b]"}`} aria-label={friend.is_online ? "Online" : "Offline"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-white">{friend.username}</p>
                  <p className={`mt-0.5 truncate text-[10px] font-semibold ${friend.is_online ? "text-trap-success" : "text-[#777782]"}`}>{friend.is_online ? "Online" : "Offline"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-xs text-[#a6a6ae]">{loaded ? "Find players to build your crew." : "Loading friends…"}</p>
        )}
        <div className="px-4 pt-4">
          <Button asChild variant="ghost" size="sm" className="w-full text-[10px] text-[#a6a6ae]">
            <Link href="/friends">View friends <ArrowUpRight className="size-3.5" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
