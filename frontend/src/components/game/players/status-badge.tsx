import type { LucideIcon } from "lucide-react";
import { Crown, Crosshair, Skull, Swords, UserRound, Vote } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "ready"
  | "host"
  | "you"
  | "voting"
  | "eliminated"
  | "round"
  | "online"
  | "sabotage";

const configs: Record<
  StatusBadgeVariant,
  { variant: BadgeProps["variant"]; icon?: LucideIcon; dot?: boolean }
> = {
  ready: { variant: "ready", dot: true },
  host: { variant: "host", icon: Crown },
  you: { variant: "you", icon: UserRound },
  voting: { variant: "voting", icon: Vote },
  eliminated: { variant: "eliminated", icon: Skull },
  round: { variant: "default", icon: Crosshair },
  online: { variant: "online", dot: true },
  sabotage: { variant: "sabotage", icon: Swords },
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusBadgeVariant;
}

export function StatusBadge({
  status,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const config = configs[status];
  const Icon = config.icon;
  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase",
        status === "online" && "normal-case",
        className,
      )}
      {...props}
    >
      {config.dot ? (
        <span
          className={cn(
            "size-2 rounded-full",
            status === "online" || status === "ready"
              ? "bg-[#34d399]"
              : "bg-current",
          )}
        />
      ) : null}
      {Icon ? <Icon className="size-3.5" strokeWidth={2.4} /> : null}
      {children}
    </Badge>
  );
}
