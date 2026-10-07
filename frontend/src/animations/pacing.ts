export const animationPacing = {
  micro: 0.28,
  icon: 0.5,
  phaseProgress: 1.5,
  mainPhase: 1.8,
  categoryReactionMs: 450,
  categoryHandoff: 0.95,
  trapLockHoldMs: 1100,
  voteLockHoldMs: 1050,
  votingCard: 0.7,
  votingStagger: 0.11,
  answerRevealStagger: 0.14,
  resultsCount: 3,
  finalResults: 3,
} as const;

export const cinematicSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 24,
  mass: 0.9,
};
