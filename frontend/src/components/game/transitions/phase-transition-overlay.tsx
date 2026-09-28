"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { createFullScreenPhaseTimeline } from "@/animations/phase-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PhaseAnnouncement } from "./phase-announcement";
import type { GamePhase } from "@/types/game";

interface Props {
  phase: GamePhase;
  contentRef: RefObject<HTMLDivElement | null>;
  onSwap: () => void;
  onComplete: () => void;
}

export function PhaseTransitionOverlay({ phase, contentRef, onSwap, onComplete }: Props) {
  const overlay = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || !overlay.current || !icon.current || !title.current) return;
    const timeline = createFullScreenPhaseTimeline({ phase, content, overlay: overlay.current, icon: icon.current, title: title.current, reducedMotion, onSwap, onComplete });
    return () => { timeline.kill(); };
  }, [contentRef, onComplete, onSwap, phase, reducedMotion]);

  return (
    <div ref={overlay} className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-background px-6 invisible opacity-0" role="status" aria-live="polite">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.12),transparent_48%)]" />
      <div data-transition-shape className="pointer-events-none absolute left-[12%] top-[20%] size-10 rotate-12 rounded-xl border border-primary/20" />
      <div data-transition-shape className="pointer-events-none absolute bottom-[18%] right-[14%] size-16 -rotate-6 rounded-full border border-secondary/20" />
      <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent animate-[transition-sweep_1.1s_ease-in-out_forwards]" />
      <PhaseAnnouncement phase={phase} iconRef={icon} titleRef={title} />
    </div>
  );
}
