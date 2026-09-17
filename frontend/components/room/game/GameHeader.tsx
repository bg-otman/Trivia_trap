"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Dices,
  Hourglass,
  MessageSquareText,
  Settings,
} from "lucide-react";

export type GamePhase =
  | "category"
  | "question"
  | "voting"
  | "results"
  | "podium";

export type GameHeaderProps = {
  roomCode?: string;
  round?: number;
  totalRounds?: number;
  phase?: GamePhase;
  secondsLeft?: number;
  unreadMessages?: number;
  playerName?: string;
  stageLabel?: string;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  onTimerEnd?: () => void;
  className?: string;
};

const phaseLabels: Record<GamePhase, string> = {
  category: "Category phase",
  question: "Question phase",
  voting: "Voting phase",
  results: "Results phase",
  podium: "Podium",
};

export default function GameHeader({
  roomCode = "7X4K2B",
  round = 1,
  totalRounds = 5,
  phase = "question",
  secondsLeft = 24,
  unreadMessages = 2,
  playerName = "Player",
  stageLabel,
  onOpenChat,
  onOpenSettings,
  onTimerEnd,
  className = "",
}: GameHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(
    Math.max(0, secondsLeft),
  );
  const timerEndWasCalled = useRef(false);
  const safeRound = Math.min(Math.max(round, 0), Math.max(totalRounds, 1));
  const progress = (safeRound / Math.max(totalRounds, 1)) * 100;
  const isTimerRunning = currentSeconds > 0;

  useEffect(() => {
    setCurrentSeconds(Math.max(0, secondsLeft));
    timerEndWasCalled.current = false;
  }, [secondsLeft]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      setCurrentSeconds((time) => Math.max(0, time - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (currentSeconds !== 0 || timerEndWasCalled.current) return;
    timerEndWasCalled.current = true;
    onTimerEnd?.();
  }, [currentSeconds, onTimerEnd]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
    } catch {
      // Clipboard access can be unavailable in non-secure preview environments.
    }
  }

  const entrance = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: -14 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.header
      {...entrance}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-30 border-b border-cyan-400/15 bg-[#05071c]/90 shadow-[0_18px_70px_rgba(4,8,35,0.65)] backdrop-blur-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="pointer-events-none absolute left-8 top-0 h-20 w-52 bg-fuchsia-500/10 blur-3xl" />

      <div className="mx-auto grid min-h-[76px] max-w-[1560px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 lg:justify-self-start">
          <motion.a
            href="/"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Trivia Trap home"
          >
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-violet-600 to-cyan-400 shadow-[0_0_24px_rgba(168,85,247,0.42)]">
              <Dices
                className="relative z-10 text-white"
                size={20}
                strokeWidth={2.6}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent" />
            </div>
            <div className="hidden whitespace-nowrap text-[19px] font-black tracking-[0.04em] text-white sm:block">
              TRIVIA <span className="text-pink-300">TRAP</span>
            </div>
          </motion.a>

          <button
            type="button"
            onClick={copyRoomCode}
            className="group hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-xs text-white/55 transition hover:border-cyan-400/25 hover:bg-white/[0.08] md:flex"
            aria-label={`Copy room code ${roomCode}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
              Room
            </span>
            <span className="font-black tracking-[0.16em] text-cyan-300">
              {roomCode}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "check" : "copy"}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
              >
                {copied ? (
                  <Check size={13} className="text-emerald-300" />
                ) : (
                  <Copy size={13} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="hidden justify-self-center lg:block">
          <CountdownBadge
            seconds={currentSeconds}
            reduceMotion={Boolean(reduceMotion)}
          />
        </div>

        <div className="flex min-w-0 shrink-0 items-center justify-self-end gap-2">
          <div className="lg:hidden">
            <CountdownBadge
              seconds={currentSeconds}
              reduceMotion={Boolean(reduceMotion)}
              compact
            />
          </div>

          <div className="hidden h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 lg:flex">
            <div className="leading-none">
              <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">
                Round
              </span>
              <span className="mt-1 block text-xs font-black text-white">
                {safeRound}{" "}
                <span className="text-white/30">/ {totalRounds}</span>
              </span>
            </div>
            <div className="hidden xl:flex" aria-hidden="true">
              {totalRounds <= 5 ? (
                <div className="flex gap-1.5">
                  {Array.from({ length: totalRounds }, (_, index) => (
                    <motion.span
                      key={index}
                      animate={
                        index === safeRound - 1 && !reduceMotion
                          ? { scale: [1, 1.35, 1] }
                          : undefined
                      }
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className={`h-2 w-2 rounded-full ${
                        index < safeRound
                          ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.95)]"
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 shadow-[0_0_9px_rgba(34,211,238,0.8)]"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.55,
                      ease: "easeOut",
                    }}
                  />
                  {!reduceMotion && (
                    <motion.span
                      className="absolute inset-y-0 w-5 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                      animate={{ x: [-20, 80] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <IconButton label="Open chat" onClick={onOpenChat}>
            <MessageSquareText size={18} />
            {unreadMessages > 0 && (
              <motion.span
                initial={reduceMotion ? undefined : { scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#07091d] bg-pink-500 px-1 text-[10px] font-black text-white"
              >
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </motion.span>
            )}
          </IconButton>

          <IconButton
            label="Game settings"
            onClick={onOpenSettings}
            className="hidden sm:grid"
          >
            <Settings size={18} />
          </IconButton>

          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 3 }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-400 p-[2px] shadow-[0_0_22px_rgba(168,85,247,0.35)]"
            title={playerName}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-[#0a0d25] text-sm font-black uppercase text-white">
              {playerName.trim().charAt(0) || "P"}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-[3px] bg-white/[0.035]">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: "easeOut" }}
        />
      </div>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute left-1/2 top-full -translate-x-1/2 rounded-b-xl border-x border-b border-white/10 bg-[#12152d]/95 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 shadow-lg backdrop-blur-xl"
      >
        {stageLabel ?? phaseLabels[phase]}
      </motion.div>
    </motion.header>
  );
}

function CountdownBadge({
  seconds,
  reduceMotion,
  compact = false,
}: {
  seconds: number;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  const isUrgent = seconds > 0 && seconds < 10;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const time = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

  return (
    <motion.div
      animate={
        isUrgent && !reduceMotion
          ? {
              y: [0, -4, 0],
              scale: [1, 1.045, 1],
              boxShadow: [
                "0 0 18px rgba(236,72,153,0.20)",
                "0 0 38px rgba(236,72,153,0.58)",
                "0 0 18px rgba(236,72,153,0.20)",
              ],
            }
          : { y: 0, scale: 1 }
      }
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.035 }}
      transition={{ duration: 0.72, repeat: isUrgent ? Infinity : 0, ease: "easeInOut" }}
      className={`flex items-center justify-center border font-black tabular-nums ${
        compact
          ? "h-11 min-w-[78px] gap-2 rounded-xl px-3"
          : "h-14 min-w-[154px] gap-3 rounded-2xl px-5"
      } ${
        isUrgent
          ? "border-pink-400/55 bg-pink-500/10 text-pink-300 shadow-[0_0_28px_rgba(236,72,153,0.3)]"
          : "border-cyan-400/40 bg-[#07162a]/90 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
      }`}
      role="timer"
      aria-label={`${seconds} seconds remaining`}
    >
      <div className="relative grid place-items-center">
        {!reduceMotion && (
          <motion.span
            className={`absolute rounded-full border ${isUrgent ? "border-pink-300/40" : "border-cyan-300/35"}`}
            animate={{ width: [20, 31], height: [20, 31], opacity: [0.7, 0] }}
            transition={{
              duration: isUrgent ? 0.7 : 1.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
        <motion.span
          initial={false}
          animate={{
            rotate: [0, 360],
            scale: isUrgent ? [1, 1.16, 1] : 1,
            opacity: 1,
          }}
          transition={{
            rotate: {
              duration: 1.6,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            },
            scale: { duration: 0.55, repeat: isUrgent ? Infinity : 0 },
            opacity: { duration: 0.2 },
          }}
          className="relative z-10 block"
        >
          <Hourglass size={compact ? 16 : 19} strokeWidth={2.5} />
        </motion.span>
      </div>
      <div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={seconds}
            initial={
              reduceMotion
                ? undefined
                : { y: -8, opacity: 0, filter: "blur(3px)" }
            }
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? undefined
                : { y: 8, opacity: 0, filter: "blur(3px)" }
            }
            transition={{ duration: 0.22 }}
            className={
              compact ? "block text-sm" : "block text-xl tracking-[0.08em]"
            }
          >
            {time}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function IconButton({
  label,
  onClick,
  className = "grid",
  children,
}: {
  label: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      className={`relative h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white/65 transition-colors hover:border-cyan-400/25 hover:bg-white/[0.08] hover:text-white ${className}`}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}
