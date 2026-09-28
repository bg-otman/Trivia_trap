import type { RefObject } from "react";
import { PhaseIcon, getPhasePresentation } from "./phase-icon";
import type { GamePhase } from "@/types/game";

export function PhaseAnnouncement({ phase, iconRef, titleRef }: { phase: GamePhase; iconRef: RefObject<HTMLDivElement | null>; titleRef: RefObject<HTMLHeadingElement | null> }) {
  const presentation = getPhasePresentation(phase);
  return (
    <div className="relative z-10 text-center">
      <div ref={iconRef} className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-primary/35 bg-[#1c1c22] text-4xl shadow-[0_16px_50px_rgba(255,107,53,0.16)]"><PhaseIcon phase={phase} /></div>
      <h2 ref={titleRef} className="mt-5 font-display text-3xl font-black tracking-[0.08em] text-foreground sm:text-5xl">{presentation.label}</h2>
      <p className="mt-2 text-[10px] font-black tracking-[0.2em] text-primary">NEXT PHASE</p>
    </div>
  );
}
