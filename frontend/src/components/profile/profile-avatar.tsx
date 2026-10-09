"use client";

import { useState } from "react";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ProfileAvatar({ name, imageUrl, size }: { name: string; imageUrl: string | null; size: 40 | 56 | 96 }) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <PlayerAvatar
        name={name}
        size={size}
        animated
      />
    );
  }

  return (
    <Avatar className={cn("ring-2 ring-border", size === 96 ? "size-24" : size === 56 ? "size-14" : "size-10")}>
      <AvatarImage src={imageUrl} alt={`${name} avatar`} onError={() => setFailed(true)} />
    </Avatar>
  );
}
