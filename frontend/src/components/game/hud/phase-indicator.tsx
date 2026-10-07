"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { GamePhase } from "@/types/game";
import { gameSpring } from "../system/phase-transition";
import { animatePhaseIndicator, capturePhaseIndicator } from "@/animations/phase-progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PhaseIndicatorProps {
  phase: GamePhase;
  className?: string;
}

const phases: Array<{ phase: GamePhase; label: string; icon: string }> = [
  { phase: "CATEGORY", label: "CATEGORY", icon: "🎯" },
  { phase: "TRAP", label: "TRAP", icon: "🪤" },
  { phase: "VOTING", label: "VOTING", icon: "🗳️" },
  { phase: "RESULTS_REVEAL", label: "REVEAL", icon: "👁️" },
  { phase: "ROUND_RESULTS", label: "RESULTS", icon: "🏆" },
];

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const reducedMotion = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const railElement = rail.current;
    animatePhaseIndicator(railElement, Boolean(reducedMotion));
    return () => capturePhaseIndicator(railElement);
  }, [phase, reducedMotion]);

  if (phase === "LOBBY") {
    return <div className={cn("rounded-full border border-secondary/40 bg-secondary px-4 py-2 text-xs font-bold tracking-wide text-white", className)}>LOBBY</div>;
  }

  const activeIndex = phase === "FINAL_RESULTS" ? phases.length : phases.findIndex((item) => item.phase === phase);

  return (
    <div ref={rail} className={cn("flex items-center rounded-full border border-white/10 bg-black/20 p-1", className)} aria-label="Game phase progress">
      {phases.map((item, index) => {
        const active = item.phase === phase;
        const complete = index < activeIndex;
        return (
          <div key={item.phase} className="flex items-center">
            {index > 0 ? (
              <span className="relative hidden h-px w-2 overflow-hidden bg-white/10 sm:block">
                {(complete || active) && <motion.span className="absolute inset-0 origin-left bg-accent/70" initial={{ scaleX: reducedMotion ? 1 : 0 }} animate={{ scaleX: 1 }} transition={gameSpring} />}
              </span>
            ) : null}
            <motion.div
              layout
              className={cn(
                "relative flex h-8 items-center gap-1.5 rounded-full px-2 text-[10px] font-black",
                active && "text-white",
                complete && "text-accent",
                !active && !complete && "text-muted-foreground",
              )}
              animate={active && !reducedMotion ? { scale: [0.92, 1.06, 1] } : { scale: 1 }}
              transition={{ ...gameSpring, scale: { type: "tween", duration: 0.35, ease: "easeInOut" } }}
              aria-current={active ? "step" : undefined}
              title={item.label}
            >
              {active && <span data-phase-indicator data-flip-id="active-phase-node" className="absolute inset-0 rounded-full bg-secondary" />}
              <motion.span data-phase-handoff-target={item.phase} className="relative z-10" animate={active && !reducedMotion ? { scale: [0.75, 1.18, 1] } : { scale: 1 }} transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }} aria-hidden="true">{item.icon}</motion.span>
              <span className={cn("relative z-10 hidden tracking-[0.06em]", active && "xl:inline")}>{item.label}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
