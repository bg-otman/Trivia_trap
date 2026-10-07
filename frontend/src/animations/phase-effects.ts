import { gsap } from "gsap";

export function animatePhaseAccent(scope: HTMLElement) {
  return gsap.fromTo(
    scope.querySelectorAll<HTMLElement>("[data-transition-shape]"),
    { autoAlpha: 0, scale: 0.8, rotate: -8 },
    { autoAlpha: 0.45, scale: 1, rotate: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" },
  );
}
