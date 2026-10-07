"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { gameSpring } from "../system/phase-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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

export function CountdownTimer({ seconds, state = seconds <= 5 ? "critical" : seconds <= 10 ? "warning" : "normal", size = "ring", className }: CountdownTimerProps) {
  const reducedMotion = useReducedMotion();
  const c = colors[state];
  return (
    <motion.div
      key={state}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
      animate={state === "critical" && !reducedMotion ? { opacity: 1, scale: [1, 1.06, 1] } : { opacity: 1, scale: 1 }}
      transition={state === "critical" && !reducedMotion ? { duration: seconds <= 3 ? 0.55 : 0.9, repeat: Infinity } : gameSpring}
      className={cn(
        size === "pill" ? "rounded-full border bg-[#0e0e11] px-3 py-1 font-mono text-sm font-bold" : "flex size-14 items-center justify-center rounded-full border-4 bg-popover font-mono text-lg font-bold",
        c.border,
        c.text,
        className,
      )}
    >
      {String(seconds).padStart(2, "0")}s
    </motion.div>
  );
}
