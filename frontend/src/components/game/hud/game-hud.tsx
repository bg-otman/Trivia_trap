"use client";

import { Settings, Volume2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./countdown-timer";
import { RoomCode } from "./room-code";

interface GameHudProps {
  round?: number;
  totalRounds?: number;
  seconds?: number;
  roomCode?: string;
  onSettings?: () => void;
  onAudio?: () => void;
}

export function GameHud({
  round = 2,
  totalRounds = 5,
  seconds = 18,
  roomCode = "X7K9P2",
  onSettings,
  onAudio,
}: GameHudProps) {
  return (
    <div className="flex min-h-16 flex-col gap-4 rounded-2xl border border-[#2a2a35] bg-[#1c1c22] px-4 py-3 shadow-lg md:flex-row md:items-center md:justify-between md:px-6 md:py-1">
      <div className="flex items-center gap-2">
        <Zap className="size-5 fill-primary text-primary" />
        <span className="font-display text-lg font-black tracking-[0.05em] text-white">
          TRIVIA TRAP
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="font-display text-sm font-bold tracking-[0.05em] text-white">
            ROUND {round} / {totalRounds}
          </p>
          <div className="mt-1 flex gap-1.5">
            {Array.from({ length: totalRounds }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-full ${i < round - 1 ? "bg-[#34d399]" : i === round - 1 ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <CountdownTimer seconds={seconds} size="pill" />
        <RoomCode code={roomCode} compact />
        <div className="flex gap-1">
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
    </div>
  );
}
