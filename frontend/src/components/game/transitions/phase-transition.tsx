"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PhaseTransitionOverlay } from "./phase-transition-overlay";
import type { GamePhase } from "@/types/game";

interface Props {
  phase: GamePhase;
  children: (phase: GamePhase) => ReactNode;
}

export function FullScreenPhaseTransition({ phase, children }: Props) {
  const [displayedPhase, setDisplayedPhase] = useState(phase);
  const [pendingPhase, setPendingPhase] = useState<GamePhase | null>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === displayedPhase || pendingPhase) return;
    let cancelled = false;
    const useDedicatedCinematic =
      (displayedPhase === "LOBBY" && phase === "CATEGORY") ||
      phase === "FINAL_RESULTS";

    queueMicrotask(() => {
      if (cancelled) return;
      if (useDedicatedCinematic) setDisplayedPhase(phase);
      else setPendingPhase(phase);
    });

    return () => { cancelled = true; };
  }, [displayedPhase, pendingPhase, phase]);

  const swap = useCallback(() => {
    if (pendingPhase) setDisplayedPhase(pendingPhase);
  }, [pendingPhase]);

  const complete = useCallback(() => {
    setPendingPhase(null);
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col justify-center">
      <div ref={content} className="flex w-full flex-1 flex-col justify-center" aria-busy={Boolean(pendingPhase)} style={{ pointerEvents: pendingPhase ? "none" : undefined }}>
        {children(displayedPhase)}
      </div>
      {pendingPhase ? (
        <PhaseTransitionOverlay phase={pendingPhase} contentRef={content} onSwap={swap} onComplete={complete} />
      ) : null}
    </div>
  );
}
