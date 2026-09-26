import { gsap } from "gsap";
import { animatePhaseAccent } from "./phase-effects";
import { handoffPhaseIcon } from "./phase-handoff";
import type { GamePhase } from "@/types/game";

interface Options {
  phase: GamePhase;
  content: HTMLElement;
  overlay: HTMLElement;
  icon: HTMLElement;
  title: HTMLElement;
  reducedMotion: boolean;
  onSwap: () => void;
  onComplete: () => void;
}

export function createFullScreenPhaseTimeline({ phase, content, overlay, icon, title, reducedMotion, onSwap, onComplete }: Options) {
  const timeline = gsap.timeline({ onComplete });
  if (reducedMotion) {
    return timeline.to(content, { autoAlpha: 0, duration: 0.12 }).call(onSwap).to(content, { autoAlpha: 1, duration: 0.18 });
  }

  timeline.add(animatePhaseAccent(overlay), 0.2);
  return timeline
    // Let the outgoing phase settle before the transition takes visual control.
    .to(content, { scale: 0.985, y: -6, duration: 0.25, ease: "power3.inOut" }, 0)
    .to(content, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.16)
    .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, ease: "power3.inOut" }, 0.14)
    // This is the primary phase movement: deliberately longer than a micro-interaction.
    .fromTo(
      icon,
      { autoAlpha: 0, scale: 0.68, y: 24, rotate: -8 },
      { autoAlpha: 1, scale: 1.08, y: 0, rotate: 0, duration: 0.6, ease: "power3.inOut" },
      0.2,
    )
    .to(icon, { scale: 1, duration: 0.16, ease: "power3.inOut" }, 0.68)
    // The next phase becomes legible before its full content enters.
    .fromTo(title, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power3.inOut" }, 0.65)
    .call(onSwap, [], 0.72)
    .call(() => { handoffPhaseIcon(icon, phase); }, [], 0.78)
    // 100ms between the phase swap and content entrance gives the handoff room to breathe.
    .fromTo(content, { autoAlpha: 0, scale: 0.975, y: 22 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.inOut", clearProps: "transform,opacity,visibility" }, 0.82)
    .to(overlay, { autoAlpha: 0, duration: 0.3, ease: "power3.inOut" }, 0.92)
    // Keep interaction disabled until the visual handoff has fully landed.
    .to({}, { duration: 0.08 }, 1.22);
}
