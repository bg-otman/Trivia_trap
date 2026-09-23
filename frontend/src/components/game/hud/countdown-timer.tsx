import { cn } from "@/lib/utils";

export type CountdownState = "normal" | "warning" | "critical";

interface CountdownTimerProps {
  seconds: number;
  state?: CountdownState;
  size?: "pill" | "ring";
  className?: string;
}

const colors: Record<CountdownState, { border: string; text: string }> = {
  normal: { border: "border-primary", text: "text-[#ffb59d]" },
  warning: { border: "border-accent", text: "text-[#efc141]" },
  critical: { border: "border-[#f43f5e]", text: "text-[#fb7185]" },
};

export function CountdownTimer({
  seconds,
  state = seconds <= 5 ? "critical" : seconds <= 10 ? "warning" : "normal",
  size = "ring",
  className,
}: CountdownTimerProps) {
  const c = colors[state];
  if (size === "pill") {
    return (
      <div
        className={cn(
          "rounded-full border bg-[#0e0e11] px-3 py-1 font-mono text-sm font-bold",
          c.border,
          c.text,
          state === "critical" && "trap-panic-pulse",
          className,
        )}
      >
        {String(seconds).padStart(2, "0")}s
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-14 items-center justify-center rounded-full border-4 bg-popover font-mono text-lg font-bold",
        c.border,
        c.text,
        state === "critical" && "trap-panic-pulse",
        className,
      )}
    >
      {String(seconds).padStart(2, "0")}s
    </div>
  );
}
