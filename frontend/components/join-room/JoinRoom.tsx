"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Sparkles, Dices } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinRoom() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const joinRoom = () => {
    const code = roomCode.trim().toUpperCase();

    if (!code) {
      setError("Enter a room code.");
      return;
    }

    if (code.length !== 6) {
      setError("Room codes are 6 characters.");
      return;
    }

    setError("");

    // Static frontend testing
    router.push(`/room/${code}`);
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    setRoomCode(cleaned);

    if (error) {
      setError("");
    }
  };

  return (
    <main
      className="
        relative min-h-screen w-full overflow-hidden
        bg-[#020414]
        text-white
        before:pointer-events-none
        before:fixed before:inset-0
        before:bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)]
        before:bg-[size:46px_46px]
        before:opacity-[.22]
      "
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-40 top-20
            h-105 w-105
            rounded-full
            bg-cyan-500/[0.07]
            blur-[120px]
          "
        />

        <div
          className="
            absolute -right-32 top-10
            h-105 w-105
            rounded-full
            bg-purple-600/[0.10]
            blur-[130px]
          "
        />

        <div
          className="
            absolute bottom-[-180px] left-1/2
            h-[400px] w-[500px]
            -translate-x-1/2
            rounded-full
            bg-pink-500/[0.05]
            blur-[120px]
          "
        />
      </div>

      {/* Navbar */}
      <header
        className="
          relative z-20
          mx-auto flex w-full max-w-[1390px]
          items-center justify-between
          px-[clamp(1.1rem,4.3vw,4.7rem)]
          py-6
        "
      >
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
            <Dices size={18} className="text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
          </span>
        </Link>


        <Link
          href="/"
          className="
            group flex items-center gap-2
            rounded-full
            border border-white/[0.10]
            bg-white/[0.025]
            px-4 py-2.5
            text-xs font-medium
            text-white/60
            backdrop-blur-xl
            transition-all duration-300
            hover:border-white/[0.18]
            hover:bg-white/[0.05]
            hover:text-white
          "
        >
          <ArrowLeft
            size={15}
            className="
              transition-transform duration-300
              group-hover:-translate-x-0.5
            "
          />
          Back to Home
        </Link>
      </header>

      {/* Main */}
      <div
        className="
          relative z-10
          flex min-h-[calc(100vh-96px)]
          items-center justify-center
          px-5 pb-12 pt-4
        "
      >
        <div className="w-full max-w-[560px]">

          {/* Small label */}
          <div className="mb-6 flex justify-center">
            <div
              className="
                flex items-center gap-2
                rounded-full
                border border-purple-400/[0.15]
                bg-purple-400/[0.05]
                px-3.5 py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-purple-300/80
                backdrop-blur-xl
              "
            >
              <Sparkles size={12} />
              Enter the game
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1
              className="
                font-poppins
                text-[42px]
                font-[800]
                leading-[1]
                tracking-[-1.8px]
                sm:text-[54px]
              "
            >
              Join a{" "}
              <span
                className="
                  bg-gradient-to-r
                  from-[#FF5C7A]
                  via-[#A855F7]
                  to-[#20D9F5]
                  bg-clip-text
                  text-transparent
                "
              >
                Room
              </span>
            </h1>

            <p
              className="
                mx-auto mt-4
                max-w-[410px]
                text-[13px]
                leading-6
                text-white/40
                sm:text-sm
              "
            >
              Enter the room code shared by your friend
              and jump straight into the game.
            </p>
          </div>

          {/* Card */}
          <div
            className="
              relative mt-9
              overflow-hidden
              rounded-[28px]
              border border-white/[0.09]
              bg-[linear-gradient(145deg,rgba(10,17,43,.88),rgba(4,8,25,.94))]
              p-5
              shadow-[0_30px_100px_rgba(0,0,0,.38)]
              backdrop-blur-2xl
              sm:p-7
            "
          >
            {/* Card glow */}
            <div
              className="
                pointer-events-none absolute
                -right-24 -top-24
                h-52 w-52
                rounded-full
                bg-purple-500/[0.09]
                blur-[80px]
              "
            />

            <div
              className="
                pointer-events-none absolute
                -bottom-24 -left-20
                h-48 w-48
                rounded-full
                bg-cyan-400/[0.06]
                blur-[80px]
              "
            />

            <div className="relative z-10">

              {/* Label */}
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="room-code"
                  className="text-xs font-semibold text-white/70"
                >
                  Room Code
                </label>

                <span className="text-[10px] text-white/25">
                  6 characters
                </span>
              </div>

              {/* Input */}
              <div
                className={`
                  relative rounded-2xl
                  border
                  bg-[#05091b]/80
                  transition-all duration-300
                  ${error
                    ? "border-red-400/40 shadow-[0_0_25px_rgba(248,113,113,.08)]"
                    : "border-white/[0.10] focus-within:border-purple-400/40 focus-within:shadow-[0_0_30px_rgba(139,92,246,.10)]"
                  }
                `}
              >
                <input
                  id="room-code"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoFocus
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinRoom();
                    }
                  }}
                  placeholder="AB7K2P"
                  className="
                    h-[76px] w-full
                    bg-transparent
                    px-5
                    text-center
                    font-mono
                    text-[28px]
                    font-bold
                    uppercase
                    tracking-[0.28em]
                    text-white
                    outline-none
                    placeholder:text-white/[0.12]
                    placeholder:tracking-[0.28em]
                    sm:text-[32px]
                  "
                />

                {/* Input progress */}
                <div className="absolute bottom-0 left-1/2 h-[2px] w-[calc(100%-32px)] -translate-x-1/2 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-[#FF4F81]
                      via-[#7047F5]
                      to-[#19D9ED]
                      transition-all duration-300
                    "
                    style={{
                      width: `${(roomCode.length / 6) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-2 px-1 text-[11px] text-red-300/80">
                  {error}
                </p>
              )}

              {/* Join button */}
              <button
                type="button"
                onClick={joinRoom}
                disabled={roomCode.length !== 6}
                className="
                  group/join relative mt-5
                  flex h-[56px] w-full
                  items-center justify-center
                  gap-3
                  overflow-hidden
                  rounded-2xl
                  border border-white/20
                  bg-[linear-gradient(174deg,rgba(255,79,129,1)_25%,rgba(112,71,245,1)_52%,rgba(25,217,237,1)_79%)]
                  text-sm font-bold
                  text-white
                  shadow-[0_8px_30px_rgba(103,75,245,.28)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_12px_40px_rgba(103,75,245,.45)]
                  active:scale-[0.985]
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  disabled:hover:translate-y-0
                  disabled:hover:shadow-[0_8px_30px_rgba(103,75,245,.28)]
                "
              >
                {/* Shine */}
                <span
                  className="
                    pointer-events-none absolute inset-0
                    -translate-x-[130%]
                    skew-x-[-18deg]
                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent
                    transition-transform duration-700
                    group-hover/join:translate-x-[130%]
                  "
                />

                {/* Inner highlight */}
                <span
                  className="
                    pointer-events-none absolute inset-[1px]
                    rounded-[15px]
                    border border-white/[0.12]
                    bg-gradient-to-b
                    from-white/[0.08]
                    to-transparent
                  "
                />

                <span className="relative z-10">
                  Join Room
                </span>

                <span
                  className="
                    relative z-10
                    flex h-8 w-8
                    items-center justify-center
                    rounded-full
                    border border-white/20
                    bg-white/10
                    backdrop-blur-sm
                    transition-transform duration-300
                    group-hover/join:translate-x-1
                  "
                >
                  <ArrowRight size={16} />
                </span>
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[10px] uppercase tracking-widest text-white/20">
                  or
                </span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>

              {/* Create room */}
              <Link
                href="/room/7X4K2B"
                className="
                  group/create
                  flex h-[50px] w-full
                  items-center justify-center
                  gap-2.5
                  rounded-2xl
                  border border-white/[0.10]
                  bg-white/[0.025]
                  text-xs font-semibold
                  text-white/65
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:border-white/[0.18]
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <span>Create a new room</span>

                <span
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-full
                    border border-white/[0.12]
                    bg-white/[0.04]
                    transition-all duration-300
                    group-hover/create:rotate-90
                    group-hover/create:bg-white/[0.08]
                  "
                >
                  <Plus size={15} />
                </span>
              </Link>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-7 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              <span className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base first:ml-0">
                🧑🏽
              </span>
              <span className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base">
                👩🏻
              </span>
              <span className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base">
                👨🏾
              </span>
              <span className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base">
                👩🏽‍🦱
              </span>
              <span className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base">
                🧑🏻‍🦰
              </span>
            </div>

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" />

            <span className="text-xs text-white/35">
              25K+ rooms created today
            </span>
          </div>

          {/* Footer hint */}
          <p className="mt-5 text-center text-[10px] text-white/20">
            Play fair. Bluff brilliantly.
          </p>
        </div>
      </div>
    </main>
  );
}