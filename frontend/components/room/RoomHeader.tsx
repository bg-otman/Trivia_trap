"use client";

import { ArrowLeft, Check, Copy, LogOut, Settings, Wifi } from "lucide-react";

type RoomHeaderProps = {
  playerCount: number;
  maxPlayers: number;
  onBack: () => void;
  onLeave: () => void;
  onOpenSettings: () => void;
};

export default function RoomHeader({
  playerCount,
  maxPlayers,
  onBack,
  onLeave,
  onOpenSettings,
}: RoomHeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-20
        -mx-4
        mb-5
        border-b
        border-white/[0.06]
        bg-[#030616]/80
        px-4
        py-3
        backdrop-blur-2xl
        sm:-mx-6
        sm:px-6
        lg:-mx-8
        lg:px-8
      "
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">

        {/* LEFT: back + logo + live status */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onBack}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/70
              transition-all
              duration-200
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
            "
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src="/images/logo.png"
            alt="Trivia Trap"
            className="hidden h-auto w-[110px] object-contain sm:block"
          />

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-medium text-emerald-300 md:flex">
            <Wifi size={13} />
            Connected
          </div>

        </div>

        {/* CENTER: room code — always reachable, never buried */}

        {/* RIGHT: player count + settings + leave */}

        <div className="flex items-center gap-2">

          <div className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            {playerCount}/{maxPlayers}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              px-3
              text-sm
              text-white/70
              backdrop-blur-xl
              transition
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
              sm:px-4
            "
          >
            <Settings size={17} />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-red-400/20
              bg-red-500/[0.06]
              px-3
              text-sm
              text-red-300
              transition
              hover:border-red-400/40
              hover:bg-red-500/10
            "
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Leave</span>
          </button>

        </div>

      </div>
    </header>
  );
}