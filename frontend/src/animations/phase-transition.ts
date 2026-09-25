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
    .to(content, { autoAlpha: 0, scale: 0.97, y: -12, duration: 0.32, ease: "power2.out" }, 0)
    .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: "power2.out" }, 0.16)
    .fromTo(icon, { autoAlpha: 0, scale: 0.5, rotate: -7 }, { autoAlpha: 1, scale: 1.1, rotate: 0, duration: 0.3, ease: "back.out(1.7)" }, 0.24)
    .to(icon, { scale: 1, duration: 0.14, ease: "power2.out" }, 0.52)
    .fromTo(title, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, 0.34)
    .call(onSwap, [], 0.62)
    .call(() => { handoffPhaseIcon(icon, phase); }, [], 0.68)
    .to(overlay, { autoAlpha: 0, duration: 0.24, ease: "power2.inOut" }, 0.88)
    .fromTo(content, { autoAlpha: 0, scale: 0.97, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.inOut", clearProps: "transform,opacity,visibility" }, 0.78);
}
