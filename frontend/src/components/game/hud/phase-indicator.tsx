"use client";

import * as React from "react";
import {
  CheckCircle2,
  HelpCircle,
  MessageSquareText,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type GamePhase =
  | "category"
  | "question"
  | "bluff"
  | "voting"
  | "results";

interface PhaseIndicatorProps {
  phase: GamePhase;
  className?: string;
}

const phaseConfig: Record<
  GamePhase,
  {
    label: string;
    icon: React.ElementType;
  }
> = {
  category: {
    label: "CHOOSE CATEGORY",
    icon: CheckCircle2,
  },

  question: {
    label: "QUESTION PHASE",
    icon: HelpCircle,
  },

  bluff: {
    label: "BLUFF PHASE",
    icon: MessageSquareText,
  },

  voting: {
    label: "VOTING PHASE",
    icon: CheckCircle2,
  },

  results: {
    label: "RESULTS",
    icon: Trophy,
  },
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <div className="ml-auto flex min-w-0 shrink-0 items-center">
      <div
        className={cn(
          "flex items-center gap-1.5 sm:gap-2",
          "rounded-full",
          "border border-secondary/40",
          "bg-secondary",
          "px-2.5 py-1.5 sm:px-4 sm:py-2",
          className,
        )}
      >
        <span className="size-2 shrink-0 rounded-full bg-accent" />

        <span className="truncate text-xs font-bold uppercase tracking-wide text-ring sm:block sm:max-w-[18ch] lg:max-w-none">
          {config.label}
        </span>
      </div>
    </div>
  );
}
