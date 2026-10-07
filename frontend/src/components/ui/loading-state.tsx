import { LoaderCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title: string;
  description?: string;
  variant?: "default" | "game" | "inline";
  className?: string;
}

export function LoadingState({
  title,
  description,
  variant = "default",
  className,
}: LoadingStateProps) {
  const inline = variant === "inline";
  const Icon = variant === "game" ? Sparkles : LoaderCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 text-left",
        !inline &&
          "justify-center rounded-2xl border border-border bg-card/95 px-5 py-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-secondary/30 bg-secondary/10 text-ring">
        <Icon
          className={cn("size-4", variant !== "game" && "animate-spin")}
          aria-hidden="true"
        />
      </span>
      <span>
        <span className="block font-display text-sm font-black text-foreground">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );

}
