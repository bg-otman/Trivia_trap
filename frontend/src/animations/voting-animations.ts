import { gsap } from "gsap";
import { animationPacing } from "./pacing";

export function createVotingEntrance(scope: HTMLElement, reducedMotion: boolean) {
  const options = Array.from(scope.querySelectorAll<HTMLElement>("[data-voting-option]"));
  if (options.length === 0) return gsap.timeline();

  return gsap.fromTo(
    options,
    reducedMotion
      ? { autoAlpha: 0 }
      : { autoAlpha: 0, x: (index) => (index % 2 === 0 ? -28 : 28) },
    {
      autoAlpha: 1,
      x: 0,
      duration: reducedMotion ? 0.14 : animationPacing.votingCard,
      stagger: reducedMotion ? 0 : animationPacing.votingStagger,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
    },
  );
}
