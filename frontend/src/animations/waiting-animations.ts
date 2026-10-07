import { gsap } from "gsap";
import { animate } from "animejs";

// Durations describe a complete out-and-back idle cycle.
const idleProfiles = [
  { y: -6, x: 0, rotation: 0, scale: 1, duration: 1.8 },
  { y: 0, x: 5, rotation: 0, scale: 1, duration: 2.2 },
  { y: 0, x: 0, rotation: -2, scale: 1, duration: 1.6 },
  { y: -5, x: 0, rotation: 2, scale: 1, duration: 2.4 },
  { y: 0, x: 0, rotation: 0, scale: 1.03, duration: 1.9 },
  { y: -2, x: -4, rotation: -1, scale: 1, duration: 2.1 },
] as const;

export function waitingPlayerSeed(id: string) {
  return Array.from(id).reduce(
    (seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
}

export function createWaitingIdle(
  target: HTMLElement,
  seed: number,
  emphasis = 1,
) {
  const { duration, ...pose } = idleProfiles[seed % idleProfiles.length];
  return gsap.to(target, {
    x: pose.x * emphasis,
    y: pose.y * emphasis,
    rotation: pose.rotation * emphasis,
    scale: 1 + (pose.scale - 1) * emphasis,
    duration: duration / 2,
    delay: 0.35 + (seed % 7) * 0.11,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

// One bounded scheduler for the group; Anime owns only the inner reaction layer.
export function createWaitingReactions(scope: HTMLElement, seed: number) {
  let timeout: ReturnType<typeof setTimeout>;
  let reaction: ReturnType<typeof animate> | undefined;
  let sequence = seed;

  function schedule() {
    sequence = (Math.imul(sequence, 1664525) + 1013904223) >>> 0;
    timeout = setTimeout(
      () => {
        const players = scope.querySelectorAll<HTMLElement>(
          "[data-waiting-reaction]",
        );
        const player = players[sequence % players.length];
        reaction?.revert();
        if (player) {
          reaction = animate(player, {
            translateY: [0, -4, 0],
            rotate: [0, sequence % 2 ? 1 : -1, 0],
            duration: 700,
            ease: "inOutSine",
          });
        }
        schedule();
      },
      4600 + (sequence % 2600),
    );
  }

  schedule();
  return () => {
    clearTimeout(timeout);
    reaction?.revert();
  };
}
