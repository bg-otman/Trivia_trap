import { Dices } from "lucide-react";
import Link from "next/link";

export default function RoomFooter() {
  return (
    <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-white/30 sm:flex-row">
      <div className="flex items-center gap-2">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
            <Dices size={18} className="text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
          </span>
        </Link>
        <span>Play. Bluff. Outsmart. Together.</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Room created just now
        </span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}