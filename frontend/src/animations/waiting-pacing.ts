// Seconds unless the property ends in Ms. Independent of phase transitions.
export const waitingPacing = {
  lockHoldMs: 220,
  exit: 0.22,
  entrance: 0.32,
  playerEntrance: 0.24,
  playerStagger: 0.08,
  maxPlayerDelay: 0.32,
} as const;

export const waitingEase = [0.22, 1, 0.36, 1] as const;
