import { PlayerAvatar } from "@/components/game/players/player-avatar";

export function ProfileAvatar({
  name,
  imageUrl,
  size,
}: {
  name: string;
  imageUrl: string | null;
  size: 40 | 56 | 96;
}) {
  return (
    <PlayerAvatar
      name={name}
      src={imageUrl ?? undefined}
      size={size}
      animated
    />
  );
}
