"use client";

import { Target, Zap } from "lucide-react";
import { useTheatreCinematic } from "@/hooks/use-theatre-cinematic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function GameIntro({ round }: { round: number }) {
  const reducedMotion = useReducedMotion();
  const progress = useTheatreCinematic("Game Intro", 1.6, !reducedMotion);
  if (reducedMotion) return null;
  const visibleProgress = progress;
  const introOpacity = visibleProgress < 0.12 ? visibleProgress / 0.12 : visibleProgress > 0.84 ? (1 - visibleProgress) / 0.16 : 1;
  const titleOpacity = clamp((visibleProgress - 0.12) / 0.16);
  const roundOpacity = clamp((visibleProgress - 0.35) / 0.16);
  const startOpacity = clamp((visibleProgress - 0.58) / 0.14);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b0b0e]/95 px-6" style={{ opacity: introOpacity }} aria-label="Game starting">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary" style={{ opacity: titleOpacity, transform: `translateY(${(1 - titleOpacity) * 12}px) scale(${0.9 + titleOpacity * 0.1})` }}>
          <Zap className="size-8 fill-current" />
        </div>
        <h2 className="mt-5 font-display text-3xl font-black tracking-[0.08em] text-white sm:text-5xl" style={{ opacity: titleOpacity }}>TRIVIA TRAP</h2>
        <div className="mt-6 flex items-center justify-center gap-2 text-accent" style={{ opacity: roundOpacity, transform: `translateY(${(1 - roundOpacity) * 10}px)` }}>
          <Target className="size-5" />
          <p className="font-display text-lg font-black">ROUND {round}</p>
        </div>
        <p className="mt-5 text-xs font-black tracking-[0.25em] text-primary" style={{ opacity: startOpacity, transform: `scale(${0.92 + startOpacity * 0.08})` }}>GAME START</p>
      </div>
    </div>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
