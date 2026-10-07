import { gsap } from "gsap";
import { animationPacing } from "./pacing";

export function createPhaseEntrance(scope: HTMLElement, reducedMotion: boolean) {
  const surface = scope.querySelector<HTMLElement>("[data-phase-surface]");
  if (!surface) return gsap.timeline();

  return gsap.timeline().fromTo(
    surface,
    reducedMotion ? { autoAlpha: 0 } : { autoAlpha: 0, scale: 0.965, y: 10 },
    {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      duration: reducedMotion ? 0.14 : animationPacing.mainPhase,
      ease: reducedMotion ? "none" : "power3.inOut",
      clearProps: "transform,opacity,visibility",
    },
  );
}
