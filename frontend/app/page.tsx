"use client";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CategorySection from "@/components/landing/CategorySection";
import FeatureSection from "@/components/landing/FeatureSection";
import { useState } from "react";

import { Gamepad2, ChevronDown, Plus, ArrowRight, ShieldCheck, Laugh, Trophy } from "lucide-react";

export default function Home() {
  const [notice, setNotice] = useState("");

  const begin = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_75%_20%,rgba(60,34,168,.18),transparent_26rem),radial-gradient(circle_at_8%_48%,rgba(0,178,255,.07),transparent_24rem),linear-gradient(135deg,#05091b_0%,#020414_48%,#070419_100%)] px-[clamp(1.1rem,4.3vw,4.7rem)] pb-8 before:pointer-events-none before:fixed before:inset-0 before:opacity-[.22] before:bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] before:bg-[size:46px_46px]">
      <Navbar />
      <Hero />

      <CategorySection />

      <FeatureSection />
      <section className="relative z-[4] mt-4 hidden min-h-[60px] grid-cols-[45px_1fr_24px] items-center rounded-[17px] border border-[rgba(142,158,213,.18)] bg-[linear-gradient(145deg,rgba(9,17,43,.76),rgba(3,9,27,.82))] p-[.55rem_.85rem] shadow-[inset_0_1px_0_rgba(255,255,255,.025)] backdrop-blur-[18px] max-[760px]:grid" id="how">
        <Gamepad2 className="h-10 w-10 rounded-xl bg-[linear-gradient(145deg,#893df4,#c149dd)] p-2" /> <strong className="text-[.86rem]">How Trivia Trap Works</strong>
        <ChevronDown className="w-[18px]" />
      </section>
      <footer className="mx-auto mt-4 flex max-w-[1390px] justify-between text-[.72rem] text-[#757c96] max-[760px]:hidden" id="faq">
        <span>© 2026 Trivia Trap</span>
        <span>Play fair. Bluff brilliantly.</span>
      </footer>
      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[99] -translate-x-1/2 rounded-full border border-[#6f52ff] bg-[#111836] px-[1.2rem] py-[.85rem] text-[.85rem] shadow-[0_10px_45px_rgba(0,0,0,.5),0_0_28px_rgba(118,53,255,.3)]" role="status">
          {notice}
        </div>
      )}
    </main>
  );
}
