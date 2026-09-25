import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { animationPacing } from "./pacing";

gsap.registerPlugin(Flip);

let previousState: ReturnType<typeof Flip.getState> | null = null;

export function capturePhaseIndicator(scope: HTMLElement | null) {
  const indicator = scope?.querySelector<HTMLElement>("[data-phase-indicator]");
  previousState = indicator ? Flip.getState(indicator) : null;
}

export function animatePhaseIndicator(scope: HTMLElement | null, reducedMotion: boolean) {
  const indicator = scope?.querySelector<HTMLElement>("[data-phase-indicator]");
  if (!indicator || reducedMotion || !previousState) return;
  Flip.from(previousState, {
    targets: indicator,
    duration: animationPacing.phaseProgress,
    ease: "power3.out",
    absolute: true,
    scale: true,
  });
  gsap.fromTo(
    indicator,
    { boxShadow: "0 0 0 rgba(255,107,53,0)" },
    { boxShadow: "0 0 16px rgba(255,107,53,.28)", duration: 0.32, yoyo: true, repeat: 1 },
  );
}
