import { ArrowRight, Eye, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseContent, StaggerGroup, StaggerItem } from "@/components/game/system/phase-transition";
import {
  CorrectAnswerCard,
  SubmittedAnswerCard,
} from "@/components/game/results/answer-reveal-card";
import type { AnswerReveal } from "@/types/results";

interface ResultsRevealPhaseProps {
  reveal: AnswerReveal;
  onShowResults: () => void;
}

export function ResultsRevealPhase({
  reveal,
  onShowResults,
}: ResultsRevealPhaseProps) {
  return (
    <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="w-full max-w-[1080px]">
        <PhaseContent className="mb-5 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-accent">
            <Eye className="size-4" aria-hidden="true" />
            <span className="font-meta text-[11px] font-black tracking-[0.15em]">
              ANSWERS REVEALED
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-[-0.025em] text-foreground sm:text-3xl">
            The truth is out
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            See the real answer and every player trap before continuing.
          </p>
        </PhaseContent>

        <PhaseContent delay={0.22}><CorrectAnswerCard answer={reveal.correctAnswer} /></PhaseContent>

        <div className="mb-3 mt-6 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-[#e4e1e6]">
            <UsersRound className="size-4" aria-hidden="true" />
            <h2 className="font-display text-sm font-black tracking-[0.06em]">
              PLAYER ANSWERS
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {reveal.submissions.length} SUBMITTED
          </span>
        </div>

        <StaggerGroup delay={0.48} stagger={0.11} className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
          {reveal.submissions.map((submission, index) => (
            <StaggerItem key={submission.id} direction={index % 2 === 0 ? -1 : 1}><SubmittedAnswerCard submission={submission} /></StaggerItem>
          ))}
        </StaggerGroup>

        <PhaseContent delay={0.92} className="mt-7 flex justify-center">
          <Button
            type="button"
            size="lg"
            onClick={onShowResults}
            className="w-full sm:w-auto sm:min-w-56"
          >
            SHOW RESULTS
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </PhaseContent>
      </div>
    </section>
  );
}
