"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  LockKeyhole,
  UsersRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { findMockRoom } from "@/mocks/rooms";
import { RoomCodeInput } from "./room-code-input";
import { apiFetch } from "@/lib/api";
import { loginPathFor } from "@/lib/auth-routing";

type JoinState = "idle" | "loading" | "invalid" | "full" | "error";

const mockDelayMs = 850;

export function JoinRoom({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const normalizedInitialCode = initialCode.trim().toUpperCase().slice(0, 6);
  const [code, setCode] = useState(normalizedInitialCode);
  const [state, setState] = useState<JoinState>("idle");
  const restoredIntentStarted = useRef(false);

  const error = state === "invalid"
    ? { title: "ROOM NOT FOUND", message: "We couldn't find a room with that code.", action: "TRY AGAIN" }
    : state === "full"
      ? { title: "ROOM FULL", message: "This room has reached its maximum number of players.", action: "TRY ANOTHER ROOM" }
      : state === "error"
        ? { title: "UNABLE TO JOIN", message: "Something went wrong while joining the room.", action: "TRY AGAIN" }
        : null;

  function retry() {
    setState("idle");
  }

  function updateCode(nextCode: string) {
    setCode(nextCode);
    if (state !== "loading") setState("idle");
  }

  const join = useCallback(async (roomCode: string) => {
    if (roomCode.length !== 6) return;
    setState("loading");
    await new Promise(resolve => window.setTimeout(resolve, mockDelayMs));
    if (roomCode === "ERROR1") {
        setState("error");
        return;
    }
    const room = findMockRoom(roomCode);
    if (!room) {
        setState("invalid");
        return;
    }
    if (room.status === "full") {
        setState("full");
        return;
    }

    try {
      const session = await apiFetch("/auth/me");
      if (session.status === 401) {
        window.location.assign(loginPathFor(`/join?code=${encodeURIComponent(room.code)}`));
        return;
      }
      if (!session.ok) {
        setState("error");
        return;
      }
      router.push(`/room/${encodeURIComponent(room.code)}`);
    } catch {
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    if (normalizedInitialCode.length !== 6 || restoredIntentStarted.current) return;
    restoredIntentStarted.current = true;
    void join(normalizedInitialCode);
  }, [join, normalizedInitialCode]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    void join(code);
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
            <Link href="/dashboard"><ArrowLeft className="size-4" /> Back home</Link>
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
                <h2 className="mt-2 font-secondary text-3xl uppercase tracking-[-0.02em] text-white sm:text-4xl">{state === "loading" ? "Joining room" : "Join a room"}</h2>
                <p className="mt-3 text-sm leading-6 text-[#a6a6ae]">{state === "loading" ? "Checking room code..." : "Enter your 6-character room code."}</p>
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
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      <ErrorState title={error.title} description={error.message} actionLabel={error.action} onAction={retry} className="p-3" />
                    </motion.div>
                  ) : state === "loading" ? (
                    <LoadingState title="JOINING ROOM" description="Checking room code..." variant="inline" />
                  ) : (
                    <div className="flex items-center gap-2 px-1 text-[11px] text-[#777782]">
                      <LockKeyhole className="size-3.5" /> Room codes are case-insensitive
                    </div>
                  )}
                </div>

                {!error ? (
                  <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6 || state === "loading"}>
                    {state === "loading" ? "JOINING ROOM..." : <>JOIN ROOM <ArrowRight className="size-5" /></>}
                  </Button>
                ) : null}
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
