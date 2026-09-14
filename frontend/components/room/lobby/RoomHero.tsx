import { UserPlus } from "lucide-react";

import RoomCode from "./RoomCode";

type RoomHeroProps = {
  roomCode: string;
  copied: boolean;
  onCopy: () => void;
  onInvite: () => void;
};

export default function RoomHero({
  roomCode,
  copied,
  onCopy,
  onInvite,
}: RoomHeroProps) {
  return (
    <section
      aria-labelledby="room-lobby-title"
      className="relative mb-5 overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-br from-[#091737]/90 via-[#080d2a]/90 to-[#16072c]/90 px-5 py-8 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:px-10 sm:py-10"
    >
      <div className="pointer-events-none absolute -left-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          role="status"
          aria-live="polite"
          className="mb-3 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-cyan-300 sm:text-[11px]"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span id="room-lobby-title">WAITING FOR PLAYERS</span>
        </div>

        <p className="text-sm text-white/40">Room Code</p>
        <RoomCode code={roomCode} copied={copied} onCopy={onCopy} />
        <p id="room-code-help" className="mt-1 text-xs text-white/35">
          Tap the code to copy, or share the link below
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={onInvite}
            aria-label="Copy invite link for this room"
            className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/80 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d2a]"
          >
            <UserPlus size={15} />
            Copy Invite Link
          </button>
        </div>
      </div>
    </section>
  );
}