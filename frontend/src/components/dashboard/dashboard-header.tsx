import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Good evening, Mehdi</p>
        <h1 className="mt-2 font-secondary text-2xl uppercase tracking-[-0.025em] text-white sm:text-3xl lg:text-[2.15rem]">
          Ready to fool your friends?
        </h1>
        <p className="mt-2 text-sm text-[#a6a6ae]">Your next great bluff is only one room away.</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <Button asChild variant="outline" className="h-11 px-4 text-xs">
          <Link href="/join">Join room <ArrowRight className="size-4" /></Link>
        </Button>
        <Button asChild className="h-11 px-4 text-xs">
          <Link href="/room/X7K9P2"><Plus className="size-4" /> Create room</Link>
        </Button>
      </div>
    </header>
  );
}
