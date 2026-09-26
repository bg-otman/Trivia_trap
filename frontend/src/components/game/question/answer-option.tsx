import { Check, Skull, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnswerState = "default" | "selected" | "correct" | "wrong";

interface AnswerOptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  letter: string;
  label: string;
  state?: AnswerState;
  meta?: string;
}

const stateClasses: Record<AnswerState, string> = {
  default: "border-border bg-popover shadow-[0_4px_0_rgba(0,0,0,0.45)]",
  selected:
    "border-primary bg-[rgba(255,107,53,0.15)] shadow-[0_10px_18px_rgba(255,107,53,0.10)]",
  correct:
    "border-[#34d399] bg-[rgba(16,185,129,0.15)] shadow-[0_10px_18px_rgba(16,185,129,0.10)]",
  wrong:
    "border-[#f43f5e] bg-[rgba(244,63,94,0.15)] opacity-85 shadow-[0_10px_18px_rgba(244,63,94,0.10)]",
};

const letterClasses: Record<AnswerState, string> = {
  default: "border border-border bg-muted text-[#e4e1e6]",
  selected: "bg-primary text-primary-foreground",
  correct: "bg-[#34d399] text-black",
  wrong: "bg-[#f43f5e] text-white",
};

export function AnswerOption({
  letter,
  label,
  state = "default",
  meta,
  className,
  ...props
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-[68px] w-full items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        stateClasses[state],
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold",
            letterClasses[state],
          )}
        >
          {letter}
        </span>
        <span
          className={cn(
            "truncate text-base font-semibold text-white",
            state === "selected" && "font-bold text-[#ffb59d]",
            state === "correct" && "font-bold text-[#34d399]",
            state === "wrong" && "text-[#fda4af] line-through",
          )}
        >
          {label}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold">
        {state === "selected" ? (
          <>
            <Target className="size-3.5 text-primary" />
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
              {meta ?? "LOCKED IN"}
            </span>
          </>
        ) : null}
        {state === "correct" ? (
          <>
            <Check className="size-3.5 text-[#34d399]" />
            <span className="text-[#34d399]">{meta ?? "CORRECT (+250)"}</span>
          </>
        ) : null}
        {state === "wrong" ? (
          <>
            <Skull className="size-3.5 text-[#fb7185]" />
            <span className="text-[#fb7185]">{meta ?? "TRAP TRIGGERED"}</span>
          </>
        ) : null}
        {state === "default" && meta ? (
          <span className="font-mono font-normal text-muted-foreground">{meta}</span>
        ) : null}
      </span>
    </button>
  );
}
