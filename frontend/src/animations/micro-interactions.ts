import { animate, stagger } from "animejs";

export function animateSuccessIcon(target: HTMLElement | null, reducedMotion: boolean) {
  if (!target || reducedMotion) return;
  return animate(target, {
    scale: [0.7, 1.16, 1],
    rotate: [-8, 3, 0],
    duration: 430,
    ease: "out(3)",
  });
}

export function animateTypingDots(targets: NodeListOf<Element>, reducedMotion: boolean) {
  if (reducedMotion || targets.length === 0) return;
  return animate(targets, {
    translateY: [0, -3, 0],
    opacity: [0.35, 1, 0.35],
    delay: stagger(90),
    duration: 650,
    loop: true,
    ease: "inOutSine",
  });
}
