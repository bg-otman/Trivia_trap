import type { GamePhase } from "@/types/game";

const icons: Partial<Record<GamePhase, string>> = { CATEGORY: "🎯", TRAP: "🪤", VOTING: "🗳️", RESULTS_REVEAL: "👁️", ROUND_RESULTS: "🏆" };
const labels: Partial<Record<GamePhase, string>> = { CATEGORY: "CATEGORY", TRAP: "TRAP", VOTING: "VOTING", RESULTS_REVEAL: "ANSWER REVEAL", ROUND_RESULTS: "ROUND RESULTS" };

export function getPhasePresentation(phase: GamePhase) {
  return { icon: icons[phase] ?? "⚡", label: labels[phase] ?? phase.replaceAll("_", " ") };
}

export function PhaseIcon({ phase, className }: { phase: GamePhase; className?: string }) {
  return <span className={className} aria-hidden="true">{getPhasePresentation(phase).icon}</span>;
}
