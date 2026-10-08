import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import type { GamePhase } from "@/types/game";

gsap.registerPlugin(Flip);

export function handoffPhaseIcon(source: HTMLElement, phase: GamePhase) {
  const target = document.querySelector<HTMLElement>(`[data-phase-handoff-target="${phase}"]`);
  if (!target) return gsap.to(source, { autoAlpha: 0, scale: 0.8, duration: 0.42, ease: "power3.inOut" });

  const clone = source.cloneNode(true) as HTMLElement;
  const rect = source.getBoundingClientRect();
  Object.assign(clone.style, { position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: "0", zIndex: "90", pointerEvents: "none" });
  clone.setAttribute("aria-hidden", "true");
  document.body.appendChild(clone);
  source.style.opacity = "0";

  Flip.fit(clone, target, { duration: 0.48, ease: "power3.inOut", scale: true, absolute: true, onComplete: () => clone.remove() });
  return gsap.to(clone, { opacity: 0.15, duration: 0.2, delay: 0.3, ease: "power3.inOut" });
}
