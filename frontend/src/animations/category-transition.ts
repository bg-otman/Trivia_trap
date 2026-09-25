import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { animationPacing } from "./pacing";

gsap.registerPlugin(Flip);

let handoffClone: HTMLElement | null = null;

export function captureCategoryCard(source: HTMLElement | null, reducedMotion: boolean) {
  handoffClone?.remove();
  handoffClone = null;
  if (!source || reducedMotion) return;

  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "80",
    pointerEvents: "none",
    transformOrigin: "center",
  });
  clone.setAttribute("aria-hidden", "true");
  document.body.appendChild(clone);
  handoffClone = clone;
  gsap.fromTo(clone, { scale: 1 }, { scale: 1.05, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
}

export function playCategoryHandoff(target: HTMLElement | null, reducedMotion: boolean) {
  const clone = handoffClone;
  handoffClone = null;
  if (!clone || !target || reducedMotion) {
    clone?.remove();
    return;
  }

  Flip.fit(clone, target, {
    duration: animationPacing.categoryHandoff,
    ease: "power3.inOut",
    scale: true,
    absolute: true,
    onComplete: () => clone.remove(),
  });
  gsap.to(clone, { opacity: 0, rotate: -1.5, duration: 0.24, delay: 0.58, ease: "power2.in" });
}
