"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, LockKeyhole, MessageSquareText, Send } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/game/question/question-card";
import { PhaseContent, gameSpring } from "@/components/game/system/phase-transition";
import { animateSuccessIcon } from "@/animations/micro-interactions";
import type { Question } from "@/types/question";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface TrapPhaseProps {
  question: Question;
  currentRound: number;
  totalRounds: number;
  answer: string;
  submitted: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmitAnswer: (answer: string) => void;
}

export function TrapPhase({
  question,
  currentRound,
  totalRounds,
  answer,
  submitted,
  onAnswerChange,
  onSubmitAnswer,
}: TrapPhaseProps) {
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const successIcon = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!submitted) return;
    const animation = animateSuccessIcon(successIcon.current, Boolean(reducedMotion));
    return () => { animation?.cancel(); };
  }, [submitted, reducedMotion]);

  function submitTrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAnswer = answer.trim();

    if (trimmedAnswer.length < 2) {
      setError("Write a convincing answer before submitting.");
      return;
    }

    setError(null);
    onSubmitAnswer(trimmedAnswer);
  }

  return (
    <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="w-full max-w-[1080px]">
        <PhaseContent className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <MessageSquareText className="size-4" aria-hidden="true" />
              <span className="font-meta text-[11px] font-black tracking-[0.14em]">
                BUILD YOUR TRAP
              </span>
            </div>
            <h2 className="font-display text-xl font-black text-foreground sm:text-2xl">
              Make your answer believable
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-5 text-[#a6a6ae] sm:text-right">
            Write an answer that could fool the other players.
          </p>
        </PhaseContent>

        <div>
          <QuestionCard
          question={question}
          currentRound={currentRound}
          totalRounds={totalRounds}
          />
        </div>

        <PhaseContent delay={0.08} className="mt-5 rounded-2xl border border-white/10 bg-[#19191f]/90 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.2)] sm:p-6">
          {submitted ? (
            <div className="flex min-h-[138px] flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-primary">
                <LockKeyhole className="size-4" aria-hidden="true" />
                <p className="font-meta text-[11px] font-black tracking-[0.13em]">
                  TRAP SUBMITTED · LOCKED
                </p>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <motion.span ref={successIcon} initial={reducedMotion ? { opacity: 0 } : { opacity: 1 }} animate={{ opacity: 1 }} transition={gameSpring}><Check className="size-3.5 text-[#34d399]" aria-hidden="true" /></motion.span>
                Waiting for other players...
              </p>
            </div>
          ) : (
            <form onSubmit={submitTrap}>
              <label
                htmlFor="trap-answer"
                className="font-meta text-[11px] font-black tracking-[0.13em] text-primary"
              >
                YOUR ANSWER
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Input
                  id="trap-answer"
                  value={answer}
                  onChange={(event) => {
                    onAnswerChange(event.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={80}
                  autoComplete="off"
                  placeholder="Write an answer that could fool the other players..."
                  aria-describedby={error ? "trap-error" : "trap-help"}
                  aria-invalid={Boolean(error)}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-black/25 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-[#6f6f78] focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" className="h-12 px-6">
                  SUBMIT ANSWER
                  <Send className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3 text-[11px]">
                <p
                  id={error ? "trap-error" : "trap-help"}
                  className={error ? "text-destructive" : "text-muted-foreground"}
                  role={error ? "alert" : undefined}
                >
                  {error ?? "Keep it short, specific, and believable."}
                </p>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {answer.length}/80
                </span>
              </div>
            </form>
          )}
        </PhaseContent>
      </div>
    </section>
  );
}
