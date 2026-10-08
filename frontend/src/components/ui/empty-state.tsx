import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, icon: Icon = Inbox, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-5 py-8 text-center", className)}>
      <span className="grid size-11 place-items-center rounded-2xl border border-secondary/25 bg-secondary/10 text-ring">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-display text-sm font-black text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      {actionLabel ? <Button type="button" variant="surface" size="sm" className="mt-4" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
