import { ArrowUpRight, Users } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { onlineFriends } from "@/mocks/dashboard";
import { cn } from "@/lib/utils";

export function FriendsOnline() {
  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-trap-success">4 available now</p>
          <CardTitle className="mt-1 font-secondary text-lg uppercase">Friends online</CardTitle>
        </div>
        <Users className="size-5 text-[#9295ff]" aria-hidden="true" />
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-white/[0.055]">
          {onlineFriends.map((friend) => (
            <div key={friend.name} className="flex items-center gap-3 px-4 py-3.5">
              <Avatar size="lg">
                <AvatarFallback className={cn("text-xs font-black text-white", friend.color)}>{friend.initials}</AvatarFallback>
                <AvatarBadge className="bg-trap-success ring-trap-surface" />
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-white">{friend.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-[#777782]">{friend.status}</p>
              </div>
              <span className="size-2 rounded-full bg-trap-success shadow-[0_0_10px_rgba(74,222,128,0.45)]" aria-label="Online" />
            </div>
          ))}
        </div>
        <div className="px-4 pt-4">
          <Button type="button" variant="ghost" size="sm" className="w-full text-[10px] text-[#a6a6ae]">
            View friends <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
