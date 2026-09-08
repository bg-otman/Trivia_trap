"use client";

import { Copy, Check } from "lucide-react";

type RoomCodeProps = {
  code: string;
  copied: boolean;
  onCopy: () => void;
};

export default function RoomCode({
  code,
  copied,
  onCopy,
}: RoomCodeProps) {
  return (
    <div className="mt-1 flex items-center gap-3">

      <h1
        className="
          font-poppins
          text-[42px]
          font-[900]
          tracking-[2px]
          text-white
          drop-shadow-[0_0_25px_rgba(139,92,246,.2)]
          sm:text-[58px]
        "
      >
        {code}
      </h1>

      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy room code"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          text-white/60
          transition
          group
          hover:border-purple-400/40
          hover:bg-purple-500/10
          hover:text-purple-300
        "
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition group-hover:text-white">
          {copied ? (
            <Check size={13} className="text-emerald-400" />
          ) : (
            <Copy size={13} />
          )}
        </span>
      </button>

    </div>
  );
}
