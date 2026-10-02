"use client";

import { useEffect, useState } from "react";
import { Settings, Volume2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GamePhase } from "@/types/game";
import { CountdownTimer } from "./countdown-timer";
import { PhaseIndicator } from "./phase-indicator";
import { RoomCode } from "./room-code";

interface GameHudProps {
  round?: number;
  totalRounds?: number;
  seconds?: number;
  roomCode?: string;
  phase?: GamePhase;
  timerMode?: "controlled" | "countdown";
  onSettings?: () => void;
  onAudio?: () => void;
}

export function GameHud({
  round = 2,
  totalRounds = 5,
  seconds = 18,
  roomCode = "X7K9P2",
  phase = "VOTING",
  timerMode = "controlled",
  onSettings,
  onAudio,
}: GameHudProps) {
  const timer = timerMode === "countdown" ? (
    <LiveCountdownTimer
      key={`${phase}-${round}-${seconds}`}
      duration={seconds}
    />
  ) : (
    <CountdownTimer seconds={seconds} size="pill" />
  );

  return (
    <header className="relative z-20 px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-2xl border border-white/10 bg-[#19191f]/95 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Zap className="size-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-black tracking-[0.06em] text-white sm:text-lg">
                TRIVIA TRAP
              </p>
              <p className="hidden text-[10px] font-bold tracking-[0.12em] text-muted-foreground sm:block">
                OUTSMART THE ROOM
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <RoundProgress round={round} totalRounds={totalRounds} />
            <span className="h-8 w-px bg-white/10" />
            <PhaseIndicator phase={phase} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {timer}
              <RoomCode code={roomCode} compact />
            </div>
            <Button
              variant="surface"
              size="icon-sm"
              onClick={onAudio}
              aria-label="Audio"
            >
              <Volume2 className="size-3.5" />
            </Button>
            <Button
              variant="surface"
              size="icon-sm"
              onClick={onSettings}
              aria-label="Settings"
            >
              <Settings className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 items-center gap-3 border-t border-white/10 bg-black/10 px-3 py-3 sm:grid-cols-[auto_1fr_auto] sm:px-5 lg:hidden">
          <RoundProgress round={round} totalRounds={totalRounds} />
          <div className="justify-self-end sm:justify-self-center">
            <PhaseIndicator phase={phase} />
          </div>
          <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
            <div className="sm:hidden">{timer}</div>
            <RoomCode code={roomCode} compact className="sm:hidden" />
          </div>
        </div>
      </div>
    </header>
  );
}

function LiveCountdownTimer({ duration }: { duration: number }) {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(Math.max(0, duration - elapsed));
    }, 250);
    return () => window.clearInterval(interval);
  }, [duration]);

  return <CountdownTimer seconds={seconds} size="pill" />;
}

function RoundProgress({
  round,
  totalRounds,
}: {
  round: number;
  totalRounds: number;
}) {
  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap font-display text-[11px] font-bold tracking-[0.08em] text-white sm:text-xs">
        ROUND {round}{" "}
        <span className="text-muted-foreground">/ {totalRounds}</span>
      </p>
      <div className="mt-1.5 flex gap-1" aria-hidden="true">
        {Array.from({ length: totalRounds }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 w-4 rounded-full sm:w-5 ${index < round - 1 ? "bg-[#34d399]" : index === round - 1 ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
