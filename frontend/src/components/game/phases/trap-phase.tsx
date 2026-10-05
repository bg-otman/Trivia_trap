"use client";

import { FormEvent, useState } from "react";
import {
  Check,
  LockKeyhole,
  MessageSquareText,
  Send,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/game/question/question-card";
import type { Player } from "@/types/player";
import type { Question } from "@/types/question";

interface TrapPhaseProps {
  question: Question;
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export function TrapPhase({
  question,
  players,
  currentRound,
  totalRounds,
}: TrapPhaseProps) {
  const [trapAnswer, setTrapAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submittedPlayers = players.filter(
    (player) => player.status === "SUBMITTED" || player.status === "VOTED",
  ).length;
  const currentPlayerAlreadySubmitted = players.some(
    (player) =>
      player.isYou &&
      (player.status === "SUBMITTED" || player.status === "VOTED"),
  );
  const visibleSubmittedCount = Math.min(
    players.length,
    submittedPlayers + (submittedAnswer && !currentPlayerAlreadySubmitted ? 1 : 0),
  );
  const progress = players.length
    ? Math.round((visibleSubmittedCount / players.length) * 100)
    : 0;

  function submitTrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = trapAnswer.trim();

    if (answer.length < 2) {
      setError("Write a convincing answer before submitting.");
      return;
    }

    setError(null);
    setSubmittedAnswer(answer);
  }

  return (
    <section className="relative z-10 flex flex-1 flex-col items-center px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="w-full max-w-[1080px]">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
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
        </div>

        <QuestionCard
          question={question}
          currentRound={currentRound}
          totalRounds={totalRounds}
        />

        <div className="mt-5">
          <div className="rounded-2xl border border-white/10 bg-[#19191f]/90 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.2)] sm:p-6">
            {submittedAnswer ? (
              <div className="flex min-h-[138px] flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 text-primary">
                  <LockKeyhole className="size-4" aria-hidden="true" />
                  <p className="font-meta text-[11px] font-black tracking-[0.13em]">
                    TRAP SUBMITTED · LOCKED
                  </p>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="size-3.5 text-[#34d399]" aria-hidden="true" />
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
                    value={trapAnswer}
                    onChange={(event) => {
                      setTrapAnswer(event.target.value);
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
                    {trapAnswer.length}/80
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
