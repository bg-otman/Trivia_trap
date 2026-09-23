import { ResultCard } from "@/components/game/results/result-card";

export function RoundResultsPhase() {
  return (
    <section className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ResultCard />
      </div>
    </section>
  );
}
