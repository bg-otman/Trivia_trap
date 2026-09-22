"use client";

import {
  Copy,
  Cpu,
  Film,
  Gamepad2,
  LoaderCircle,
  LockKeyhole,
  Mic,
  Play,
  Rocket,
  Settings,
  Swords,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnswerOption } from "@/components/game/question/answer-option";
import { CategoryCard } from "@/components/game/question/category-card";
import { CountdownTimer } from "@/components/game/hud/countdown-timer";
import { GameHud } from "@/components/game/hud/game-hud";
import { Leaderboard } from "@/components/game/results/leaderboard";
import { MatchExitDialog } from "@/components/game/system/match-exit-dialog";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { PlayerCard } from "@/components/game/players/player-card";
import { ResultCard } from "@/components/game/results/result-card";
import { RoomCode } from "@/components/game/hud/room-code";
import { StatusBadge } from "@/components/game/players/status-badge";
import {
  SpecPanel,
  SystemSection,
} from "@/components/game/system/system-section";
import { TimerMenu } from "@/components/game/hud/timer-menu";
import { VoteTrapOption } from "@/components/game/voting/vote-trap-option";

const palette = [
  ["BG Surface", "#111114"],
  ["Surface Layer", "#1C1C22"],
  ["Primary", "#FF6B35"],
  ["Secondary", "#5B5FEF"],
  ["Accent Host", "#F7C948"],
  ["Success", "#4ADE80"],
  ["Trap / Danger", "#FF4D6D"],
] as const;

const leaderboard = [
  { name: "GoldStreak", points: 2350 },
  { name: "PixelNinja", points: 1420 },
  { name: "VaporWave", points: 1100 },
  { name: "Alex_99", points: 850 },
];

function TokenIntro() {
  return (
    <section className="trap-grid-glow relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="you">
              LOBBY &amp; MATCH DESIGN SYSTEM
            </StatusBadge>
            <span className="text-xs text-muted-foreground">
              SPECIFICATION V2.4
            </span>
          </div>
          <StatusBadge status="ready">PRODUCTION READY</StatusBadge>
        </div>
        <h1 className="mt-6 max-w-5xl font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-[56px] lg:leading-[64px]">
          TRIVIA TRAP <span className="text-primary">//</span> COMPONENT SYSTEM
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          High-voltage multiplayer arcade interface kit with tactile push
          physics, deep ink-dense surfaces, competitive telemetry, and instant
          game states.
        </p>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-bold tracking-[0.1em] text-muted-foreground">
            CORE PALETTE TOKENS
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {palette.map(([name, color]) => (
              <div
                key={name}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-[#0e0e11] p-2.5"
              >
                <span
                  className="size-7 shrink-0 rounded-lg border border-white/10"
                  style={{ backgroundColor: color }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-white">
                    {name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {color}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DesignSystemShowcase() {
  return (
    <TooltipProvider delayDuration={150}>
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12">
          <TokenIntro />

          <SystemSection
            index="01"
            title="BUTTONS & INTERACTIVE CONTROLS"
            description="Skeuomorphic tactile arcade press physics with calibrated bevels and neon glows"
            meta="Radius: rounded-xl (12px)"
          >
            <SpecPanel>
              <p className="mb-4 text-xs font-bold tracking-[0.1em] text-muted-foreground">
                VARIANTS &amp; GAME ACTION ROLES
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  [
                    "PRIMARY FLAME",
                    <Button key="p" className="w-full">
                      <Play className="size-4" />
                      START GAME
                    </Button>,
                    "Key game triggers, Lock-in",
                  ],
                  [
                    "SECONDARY INDIGO",
                    <Button key="s" variant="secondary" className="w-full">
                      <Rocket className="size-4" />
                      CREATE ROOM
                    </Button>,
                    "Setup, joining, secondary nav",
                  ],
                  [
                    "HOST ACCENT",
                    <Button key="h" variant="host" className="w-full">
                      NEXT ROUND
                    </Button>,
                    "Host control, level step",
                  ],
                  [
                    "DANGER / TRAP",
                    <Button key="d" variant="destructive" className="w-full">
                      <Swords className="size-4" />
                      VOTE TRAP
                    </Button>,
                    "Sabotage, kick, eliminate",
                  ],
                  [
                    "GHOST / OUTLINE",
                    <Button key="o" variant="outline" className="w-full">
                      JOIN ROOM
                    </Button>,
                    "Spectator & passive actions",
                  ],
                ].map(([label, control, note]) => (
                  <div
                    key={String(label)}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-popover p-4"
                  >
                    <p className="text-xs font-bold text-muted-foreground">
                      {label}
                    </p>
                    <div className="my-4">{control}</div>
                    <p className="font-mono text-[11px] leading-5 text-muted-foreground">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="mb-4 text-xs font-bold tracking-[0.1em] text-muted-foreground">
                  SIZES &amp; SYSTEM INTERACTION STATES
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg">
                    <LockKeyhole className="size-4" />
                    LARGE (h-14) LOCK IN
                  </Button>
                  <Button>MEDIUM (h-11)</Button>
                  <Button size="sm">SMALL (h-9)</Button>
                  <Button disabled>
                    <LockKeyhole className="size-4" />
                    DISABLED
                  </Button>
                  <Button variant="secondary">
                    <LoaderCircle className="size-4 animate-spin" />
                    CONNECTING...
                  </Button>
                  <Button variant="surface" size="icon" aria-label="Settings">
                    <Settings className="size-4" />
                  </Button>
                </div>
              </div>
            </SpecPanel>
          </SystemSection>

          <SystemSection
            index="02"
            title="INPUTS, SEARCH & ROOM CODE COMPONENT"
            description="Deep bay inputs with high contrast focus rings, monospaced PIN targets, and one-click copy logic"
            meta="Focus: 2px Ring"
            accent="indigo"
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <SpecPanel>
                <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                  NICKNAME INPUT (STANDARD STATE)
                </p>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-[#e4e1e6]">PLAYER HANDLE</span>
                  <span className="text-muted-foreground">MAX 12 CHARS</span>
                </div>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input defaultValue="PixelNinja" className="pl-10" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Ready to enter matchmaking queue
                </p>
              </SpecPanel>
              <SpecPanel>
                <p className="mb-4 text-xs font-bold tracking-[0.06em] text-[#fb7185]">
                  INPUT (ERROR VALIDATION STATE)
                </p>
                <div className="mb-1.5 flex justify-between text-xs font-bold text-[#fb7185]">
                  <span>PLAYER HANDLE</span>
                  <span>DUPLICATE</span>
                </div>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#fb7185]" />
                  <Input defaultValue="Alex_99" invalid className="pl-10" />
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-[#fb7185]">
                  Name already taken in this room. Choose another!
                </p>
              </SpecPanel>
              <SpecPanel>
                <p className="mb-1 text-xs font-bold tracking-[0.06em] text-[#efc141]">
                  STANDALONE ROOM CODE COMPONENT
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Prominent arcade PIN bay with instant clipboard feedback
                </p>
                <RoomCode code="X7K9P2" />
              </SpecPanel>
            </div>
          </SystemSection>

          <SystemSection
            index="03"
            title="BADGES & PILL TOKENS"
            description="High-visibility status indicators, telemetry tags, and hazard badges"
            meta="Shape: rounded-full"
            accent="yellow"
          >
            <SpecPanel className="flex flex-wrap items-center gap-4">
              <StatusBadge status="ready">READY</StatusBadge>
              <StatusBadge status="host">HOST</StatusBadge>
              <StatusBadge status="you">YOU</StatusBadge>
              <StatusBadge status="voting">VOTING</StatusBadge>
              <StatusBadge status="eliminated">ELIMINATED</StatusBadge>
              <StatusBadge status="round">ROUND 2 / 5</StatusBadge>
              <StatusBadge status="online">14 PLAYERS ONLINE</StatusBadge>
              <StatusBadge status="sabotage">2X SABOTAGE TRAP</StatusBadge>
            </SpecPanel>
          </SystemSection>

          <SystemSection
            index="04"
            title="AVATAR SYSTEM & STATUS RINGS"
            description="Size scale from 32px to 96px with state rings: Online, Host Crown, Winner Glow, and Eliminated Grayscale"
            meta="Shape: rounded-full"
            accent="neutral"
          >
            <SpecPanel>
              <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                SIZING PROGRESSION (32PX TO 96PX)
              </p>
              <div className="flex flex-wrap items-end gap-6">
                {[32, 40, 48, 64, 80, 96].map((size) => (
                  <div key={size} className="text-center">
                    <PlayerAvatar
                      name="PixelNinja"
                      size={size as 32 | 40 | 48 | 64 | 80 | 96}
                    />
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {size}px{size === 96 ? " Hero" : ""}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                  GAME STATUS RINGS &amp; MODIFIERS
                </p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["READY", "Alex_99", "ready"],
                    ["ROOM HOST", "GameMaster", "host"],
                    ["TARGETED", "PixelNinja", "targeted"],
                    ["TRAPPED", "GhostPlayer", "eliminated"],
                  ].map(([label, name, status]) => (
                    <div
                      key={String(label)}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-popover p-3"
                    >
                      <PlayerAvatar
                        name={String(name)}
                        size={56}
                        status={
                          status as "ready" | "host" | "targeted" | "eliminated"
                        }
                      />
                      <div>
                        <p
                          className={`text-xs font-bold ${status === "ready" ? "text-[#34d399]" : status === "host" ? "text-accent" : status === "targeted" ? "text-[#ffb59d]" : "text-[#fb7185]"}`}
                        >
                          {label}
                        </p>
                        <p
                          className={`text-xs text-[#e4e1e6] ${status === "eliminated" ? "line-through" : ""}`}
                        >
                          {name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpecPanel>
          </SystemSection>

          <SystemSection
            index="05"
            title="GAME HEADER / HUD & COUNTDOWN TIMERS"
            description="Live in-match telemetry bar with countdown rings (Normal, Warning, and Critical Pulse)"
            meta="Height: 64px | Radius: 16px"
            accent="rose"
          >
            <SpecPanel>
              <p className="mb-3 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                IN-GAME HUD BAR (64PX)
              </p>
              <GameHud />
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                  COUNTDOWN TIMER VARIANTS
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    [
                      24,
                      "normal",
                      "NORMAL STATE",
                      "Round start, standard thinking time",
                    ],
                    [
                      10,
                      "warning",
                      "WARNING STATE",
                      "Pace accelerating, answer lock window",
                    ],
                    [
                      5,
                      "critical",
                      "CRITICAL PANIC PULSE",
                      "Trap triggers imminent, buzzer sounds",
                    ],
                  ].map(([seconds, state, label, note]) => (
                    <div
                      key={String(state)}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-popover p-4"
                    >
                      <CountdownTimer
                        seconds={Number(seconds)}
                        state={state as "normal" | "warning" | "critical"}
                      />
                      <div>
                        <p
                          className={`text-xs font-bold ${state === "warning" ? "text-[#efc141]" : state === "critical" ? "text-[#fb7185]" : "text-white"}`}
                        >
                          {label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpecPanel>
          </SystemSection>

          <SystemSection
            index="06"
            title="MULTIPLAYER SOCIAL & ROSTER SYSTEM"
            description="Player cards, compact leaderboard list, and interactive elimination voting tiles"
            meta="Cards: rounded-2xl (16px)"
            accent="indigo"
          >
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <SpecPanel>
                <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                  PLAYER CARD VARIANTS
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <PlayerCard name="Alex_99" points={850} />
                  <PlayerCard name="PixelNinja" points={1420} state="ready" />
                  <PlayerCard name="VaporWave" points={1100} state="targeted" />
                  <PlayerCard name="GoldStreak" points={2350} state="winner" />
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-3 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                    VOTE TO ELIMINATE / TRAP COMPONENT
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <VoteTrapOption name="Shadow_Rox" />
                    <VoteTrapOption name="Ghost_07" voted votes={3} />
                  </div>
                </div>
              </SpecPanel>
              <Leaderboard players={leaderboard} />
            </div>
          </SystemSection>

          <SystemSection
            index="07"
            title="GAMEPLAY CARDS (QUESTION, CATEGORIES & RESULTS)"
            description="The core active arena: 4 interactive answer options, category selection, and post-round payoff summary"
            meta="Arena Core"
            accent="yellow"
          >
            <SpecPanel className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status="you">
                  QUESTION 04 / 15 // POP CULTURE &amp; GAMING
                </StatusBadge>
                <span className="font-mono text-xs text-muted-foreground">
                  VALUE: +250 PTS
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold leading-8 text-white sm:text-2xl">
                Which classic 1980 arcade title featured the villainous alien
                creatures named “Blinky”, “Pinky”, “Inky”, and “Clyde”?
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <AnswerOption
                  letter="A"
                  label="Space Invaders"
                  meta="Default State"
                />
                <AnswerOption letter="B" label="Pac-Man" state="selected" />
                <AnswerOption letter="C" label="Galaga" state="correct" />
                <AnswerOption letter="D" label="Donkey Kong" state="wrong" />
              </div>
              <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 xl:grid-cols-[2fr_1fr]">
                <div>
                  <p className="mb-3 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                    CATEGORY SELECTION CARDS
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CategoryCard category="movies" />
                    <CategoryCard category="science" />
                    <CategoryCard category="history" />
                  </div>
                </div>
                <ResultCard />
              </div>
            </SpecPanel>
          </SystemSection>

          <SystemSection
            index="08"
            title="MODAL, DROPDOWN & TOOLTIP SPECIFICATION"
            description="High-contrast floating layers with backdrop blur, specular top highlight, and precise tooltips"
            meta="Modal: 20px (rounded-3xl)"
            accent="neutral"
          >
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <SpecPanel className="flex min-h-72 items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Interactive shadcn/Radix dialog styled to the Figma spec.
                  </p>
                  <MatchExitDialog />
                </div>
              </SpecPanel>
              <div className="flex flex-col gap-6">
                <SpecPanel>
                  <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                    MATCH SETUP SELECTOR
                  </p>
                  <TimerMenu />
                </SpecPanel>
                <SpecPanel>
                  <p className="mb-4 text-xs font-bold tracking-[0.06em] text-muted-foreground">
                    MICRO-TOOLTIPS (HIGH CONTRAST)
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="surface" size="icon">
                          <Copy className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Copy Room Code
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="surface" size="icon">
                          <Mic className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Toggle Proximity Voice
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SpecPanel>
              </div>
            </div>
          </SystemSection>

          <section className="rounded-3xl border border-border bg-[#0e0e11] p-6 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-sm font-bold tracking-[0.05em] text-white">
                DEVELOPER NOTES &amp; TOKEN TRANSLATION MATRIX
              </h2>
              <span className="font-mono text-xs text-[#34d399]">
                READY FOR REACT / SHADCN / TAILWIND
              </span>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-xs font-bold text-white">
                  1. SKEUOMORPHIC PUSH UTILITY
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Buttons use the{" "}
                  <code className="font-mono text-[#ffb59d]">.arcade-push</code>{" "}
                  utility with a bottom drop and 3px active translation. Focus
                  rings remain enabled for keyboard/controller navigation.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">
                  2. CASING &amp; DATA INTEGRITY
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Strings follow source data. Components do not force blanket
                  uppercase when server payloads require sentence case.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">
                  3. LIVE GAME WEBSOCKET SIGNALS
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Timer states map to{" "}
                  <code className="font-mono text-[#ffb59d]">primary</code>,{" "}
                  <code className="font-mono text-[#efc141]">warning</code>, and{" "}
                  <code className="font-mono text-[#fb7185]">critical</code>{" "}
                  pulse classes as round ticks expire.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}
