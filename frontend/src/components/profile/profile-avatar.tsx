import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ProfileAvatar({ name, imageUrl, size }: { name: string; imageUrl: string | null; size: 56 | 96 }) {
  if (!imageUrl) {
    return (
      <PlayerAvatar
        name={name}
        src="https://blobatar.dev/?via=dailydev"
        size={size}
        animated
      />
    );
  }

  return (
    <Avatar className={cn("ring-2 ring-border", size === 96 ? "size-24" : "size-14")}>
      <AvatarImage src={imageUrl} alt={`${name} avatar`} />
    </Avatar>
  );
}
