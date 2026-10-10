"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Keyboard, LockKeyhole, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/game/question/question-card";
import { ArabicVirtualKeyboard } from "@/components/game/question/arabic-virtual-keyboard";
import { PhaseContent } from "@/components/game/system/phase-transition";
import { WaitingArena } from "@/components/game/voting/waiting/waiting-arena";
import { WaitingSwap } from "@/components/game/voting/waiting/waiting-swap";
import { animateSuccessIcon } from "@/animations/micro-interactions";
import type { Question } from "@/types/question";
import type { Player } from "@/types/player";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { GameLanguage } from "@/types/game";

interface TrapPhaseProps {
  players: Player[];
  question: Question;
  currentRound: number;
  totalRounds: number;
  answer: string;
  submitted: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmitAnswer: (answer: string) => void;
  language?: GameLanguage;
}

export function TrapPhase({
  players,
  question,
  currentRound,
  totalRounds,
  answer,
  submitted,
  onAnswerChange,
  onSubmitAnswer,
  language = "en",
}: TrapPhaseProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);
  const arabicKeyboardOpen = language === "ar" && showArabicKeyboard;
  const submitTimeout = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const successIcon = useRef<HTMLSpanElement>(null);
  const timedOut = submitted && answer === "No answer submitted";

  useEffect(() => {
    return () => {
      if (submitTimeout.current !== null) window.clearTimeout(submitTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!submitted) return;
    const animation = animateSuccessIcon(
      successIcon.current,
      Boolean(reducedMotion),
    );
    return () => {
      animation?.cancel();
    };
  }, [submitted, reducedMotion]);

  function submitTrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitted) return;
    const trimmedAnswer = answer.trim();

    if (trimmedAnswer.length < 1) {
      setError("Write an answer before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);
    submitTimeout.current = window.setTimeout(() => {
      onSubmitAnswer(trimmedAnswer);
      setSubmitting(false);
      submitTimeout.current = null;
    }, 450);
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
            language={language}
          />
        </div>

        <PhaseContent delay={0.08} className="mt-5">
          <WaitingSwap
            waiting={submitted}
            className="min-h-64"
            arena={
              <WaitingArena
                players={players}
                confirmation={timedOut ? "TIME'S UP" : "ANSWER LOCKED"}
                message="WAITING FOR THE OTHER PLAYERS"
                detail={timedOut ? "Your answer has been locked." : "Your trap is set. Let's see who takes the bait."}
              />
            }
          >
            <form
              onSubmit={submitTrap}
              className="rounded-2xl border border-white/10 bg-[#19191f]/90 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.2)] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  id="trap-answer-label"
                  className="font-meta text-[11px] font-black tracking-[0.13em] text-primary"
                >
                  {submitted ? (
                    <span className="inline-flex items-center gap-2">
                      <LockKeyhole className="size-3.5" aria-hidden="true" />
                      ANSWER LOCKED
                    </span>
                  ) : (
                    "YOUR ANSWER"
                  )}
                </span>
                {language === "ar" && !submitted && (
                  <button
                    type="button"
                    disabled={submitting}
                    aria-pressed={arabicKeyboardOpen}
                    aria-controls={arabicKeyboardOpen ? "arabic-keyboard-panel" : undefined}
                    onClick={() => setShowArabicKeyboard((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                  >
                    <Keyboard className="size-4" aria-hidden="true" />
                    {arabicKeyboardOpen ? "إخفاء لوحة المفاتيح" : "لوحة مفاتيح عربية"}
                  </button>
                )}
              </div>
              <div className={arabicKeyboardOpen ? "mt-3 flex flex-col gap-3" : "mt-3 flex flex-col gap-3 sm:flex-row"}>
                {arabicKeyboardOpen ? (
                  <ArabicVirtualKeyboard
                    value={answer}
                    maxLength={80}
                    disabled={submitted || submitting}
                    onChange={(next) => {
                      onAnswerChange(next);
                      if (error) setError(null);
                    }}
                    onUnavailable={() => {
                      setShowArabicKeyboard(false);
                      setError("Could not load the Arabic keyboard. Use your device keyboard.");
                    }}
                  />
                ) : (
                  <Input
                    id="trap-answer"
                    aria-labelledby="trap-answer-label"
                    dir={language === "ar" ? "rtl" : "ltr"}
                    value={answer}
                    disabled={submitted || submitting}
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
                )}
                <Button
                  type="submit"
                  disabled={submitted || submitting}
                  className={arabicKeyboardOpen ? "h-12 self-end px-6" : "h-12 px-6"}
                >
                  {submitting ? "LOCKING ANSWER..." : submitted ? "ANSWER LOCKED" : "SUBMIT ANSWER"}
                  {submitted ? (
                    <span ref={successIcon}>
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <Send className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3 text-[11px]">
                <p
                  id={error ? "trap-error" : "trap-help"}
                  className={
                    error ? "text-destructive" : "text-muted-foreground"
                  }
                  role={error ? "alert" : undefined}
                >
                  {error ?? "Keep it short, specific, and believable."}
                </p>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {answer.length}/80
                </span>
              </div>
            </form>
          </WaitingSwap>
        </PhaseContent>
      </div>
    </section>
  );
}
