"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  LoaderCircle,
  LockKeyhole,
  UsersRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { findMockRoom } from "@/mocks/rooms";
import { RoomCodeInput } from "./room-code-input";

type JoinState = "idle" | "loading" | "invalid" | "full";

const mockDelayMs = 850;

export function JoinRoom() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [code, setCode] = useState("");
  const [state, setState] = useState<JoinState>("idle");

  const error = state === "invalid"
    ? { title: "ROOM NOT FOUND", message: "Check the code and try again. The room may have closed." }
    : state === "full"
      ? { title: "ROOM IS FULL", message: "This game has reached its player limit. Ask the host for another room." }
      : null;

  function updateCode(nextCode: string) {
    setCode(nextCode);
    if (state !== "loading") setState("idle");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6 || state === "loading") return;

    setState("loading");
    window.setTimeout(() => {
      const room = findMockRoom(code);
      if (!room) {
        setState("invalid");
        return;
      }
      if (room.status === "full") {
        setState("full");
        return;
      }
      router.push(`/room/${encodeURIComponent(room.code)}`);
    }, mockDelayMs);
  }

  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 opacity-45" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-[#5b5fef]/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-28 size-[32rem] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-black tracking-[0.08em] text-primary">
            <span className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/10">
              <Zap className="size-5 fill-current" aria-hidden="true" />
            </span>
            TRIVIA TRAP
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-[#a6a6ae] hover:text-white">
            <Link href="/"><ArrowLeft className="size-4" /> Back home</Link>
          </Button>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,0.72fr)] lg:gap-20">
          <motion.section
            initial={{ opacity: 0, x: reducedMotion ? 0 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.65 }}
            className="hidden lg:block"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5b5fef]/30 bg-[#5b5fef]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c0c1ff]">
              <span className="size-1.5 rounded-full bg-[#5b5fef]" /> Your crew is waiting
            </p>
            <h1 className="max-w-xl font-secondary text-[clamp(3.25rem,5vw,5.6rem)] uppercase leading-[0.96] tracking-[-0.035em]">
              Enter the room.<br /><span className="text-primary">Spring the trap.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#a6a6ae]">
              Grab the six-character code from your host and jump straight into the lobby.
            </p>
            <div className="mt-9 flex gap-6 text-xs font-bold uppercase tracking-[0.09em] text-[#777782]">
              <span className="flex items-center gap-2"><UsersRound className="size-4 text-accent" /> 2–10 players</span>
              <span className="flex items-center gap-2"><Gamepad2 className="size-4 text-[#5b5fef]" /> Browser ready</span>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: reducedMotion ? 0 : 22, scale: reducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.55, delay: reducedMotion ? 0 : 0.1 }}
            className="mx-auto w-full max-w-[500px]"
          >
            <div className="rounded-[1.4rem] border border-[#353438] bg-[#1c1c22]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8">
              <div className="mb-7">
                <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary lg:hidden">
                  <Gamepad2 className="size-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Ready to play?</p>
                <h2 className="mt-2 font-secondary text-3xl uppercase tracking-[-0.02em] text-white sm:text-4xl">Join a room</h2>
                <p className="mt-3 text-sm leading-6 text-[#a6a6ae]">Enter the code shown on the host&apos;s screen.</p>
              </div>

              <form onSubmit={submit} noValidate>
                <RoomCodeInput
                  value={code}
                  onChange={updateCode}
                  disabled={state === "loading"}
                  invalid={Boolean(error)}
                />

                <div id="room-code-status" aria-live="polite" className="min-h-[76px] pt-4">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.07] p-3.5"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <div>
                        <p className="text-xs font-extrabold text-[#fecdd3]">{error.title}</p>
                        <p className="mt-1 text-[11px] leading-4 text-[#caa8ad]">{error.message}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2 px-1 text-[11px] text-[#777782]">
                      <LockKeyhole className="size-3.5" /> Room codes are case-insensitive
                    </div>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6 || state === "loading"}>
                  {state === "loading" ? (
                    <><LoaderCircle className="size-5 animate-spin" /> Finding room...</>
                  ) : (
                    <>Join lobby <ArrowRight className="size-5" /></>
                  )}
                </Button>
              </form>
            </div>

            <p className="mt-5 text-center text-[11px] leading-5 text-[#777782]">
              Mock rooms: <button type="button" onClick={() => updateCode("X7K9P2")} className="font-bold text-[#c0c1ff] hover:text-white">X7K9P2</button> is open · <button type="button" onClick={() => updateCode("FULL42")} className="font-bold text-accent hover:text-white">FULL42</button> is full
            </p>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

