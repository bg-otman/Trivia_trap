import { Crown, Skull, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";

export type PlayerAvatarStatus =
  | "default"
  | "ready"
  | "host"
  | "targeted"
  | "eliminated";
export type PlayerAvatarSize = 32 | 40 | 48 | 56 | 64 | 80 | 96;

const sizes: Record<PlayerAvatarSize, string> = {
  32: "size-8 text-[10px]",
  40: "size-10 text-xs",
  48: "size-12 text-sm",
  56: "size-14 text-sm",
  64: "size-16 text-base",
  80: "size-20 text-lg",
  96: "size-24 text-xl",
};

interface PlayerAvatarProps {
  name: string;
  src?: string;
  size?: PlayerAvatarSize;
  status?: PlayerAvatarStatus;
  animated?: boolean;
  className?: string;
}

export function PlayerAvatar({
  name,
  src,
  size = 48,
  status = "default",
  animated = true,
  className,
}: PlayerAvatarProps) {
  // Blobatar hashes this value: preserve the existing 40px roster identity at every size.
  const avatarSource =
    src ??
    `https://blobatar.dev/avatar/${encodeURIComponent(
      name.trim().toLowerCase(),
    )}?size=40&background=none&gen=2`;


  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-label={`${name} avatar`}
    >
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#353438,#1f1f22)] font-display font-bold text-foreground",
          sizes[size],
          status === "default" && "ring-2 ring-border",
          status === "ready" &&
            "ring-2 ring-popover outline outline-2 outline-[#34d399]",
          status === "host" &&
            "ring-2 ring-popover outline outline-2 outline-accent",
          status === "targeted" &&
            "ring-2 ring-popover outline outline-2 outline-primary",
          status === "eliminated" &&
            "opacity-50 grayscale ring-2 ring-popover outline outline-2 outline-[rgba(244,63,94,0.5)]",
          size === 64 &&
            status === "default" &&
            "ring-[#131316] outline outline-2 outline-primary",
          size === 80 &&
            status === "default" &&
            "ring-[#131316] outline outline-2 outline-[#efc141]",
          size === 96 &&
            status === "default" &&
            "ring-4 ring-[#131316] outline outline-[8px] outline-primary shadow-[0_10px_24px_rgba(255,107,53,0.2)]",
        )}
      >
        {/* Keep the same avatar seed in both the static and animated render modes. */}
        <Blobatar
          name={avatarSource}
          animate={animated ? "always" : undefined}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      </span>

      {status === "ready" ? (
        <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-popover bg-[#34d399]" />
      ) : null}
      {status === "host" ? (
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
          <Crown className="size-3" fill="currentColor" />
        </span>
      ) : null}
      {status === "targeted" ? (
        <span className="absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-primary text-white">
          <Target className="size-2.5" />
        </span>
      ) : null}
      {status === "eliminated" ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-7 items-center justify-center rounded-full bg-[rgba(225,29,72,0.9)] text-white">
            <Skull className="size-3.5" />
          </span>
        </span>
      ) : null}
    </span>
  );
}
