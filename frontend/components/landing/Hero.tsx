"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Laugh,
  Trophy,
  Drama,
  Zap,
  ShieldCheck,
  Plus,
} from "lucide-react";
export default function Hero() {
  function begin(arg0: string): void {
    window.alert(arg0);
  }

  return (
    <section
      className="relative z-[2] mx-auto grid min-h-[530px] max-w-[1460px] grid-cols-[39%_61%] items-center max-[1050px]:grid-cols-[46%_54%] max-[760px]:block max-[760px]:min-h-0"
      id="top"
    >
      <div className="pointer-events-none absolute left-[30%] top-[10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
      {/* Particles */}
      <div className="particles pointer-events-none absolute inset-0 opacity-60">
        <span className="particle left-[20%] top-[15%]" />
        <span className="particle left-[42%] top-[25%]" />
        <span className="particle left-[72%] top-[18%]" />
        <span className="particle left-[83%] top-[45%]" />
        <span className="particle left-[58%] top-[55%]" />
      </div>
      <div className="relative z-[5] py-[1.1rem] pb-[1.4rem] max-[760px]:pt-2">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-white/75 backdrop-blur-xl">
          <Zap size={14} className="fill-yellow-400 text-yellow-400" />A trivia
          party.
          <span className="text-purple-300">A little bluff.</span> Endless fun.
        </div>
        <h1 className=" font-poppins text-[48px] font-[800] leading-[0.98] tracking-[-2.5px] sm:text-[60px] md:text-[72px] lg:text-[76px] ">
          <span className="block text-[#F5F5F7]"> Think fast. </span>
          <span className="block text-[#F5F5F7]"> Bluff smart. </span>
          <span className="block">
            <span className="bg-gradient-to-r from-[#FF5C7A] via-[#F05BAA] to-[#C05AEF] bg-clip-text text-transparent">
              Trap
            </span>{" "}
            <span className="bg-gradient-to-r from-[#A855F7] via-[#8C70F7] to-[#627FF4] bg-clip-text text-transparent">
              your
            </span>{" "}
            <span className="bg-gradient-to-r from-[#398CEB] via-[#20B9F3] to-[#20D9F5] bg-clip-text text-transparent">
              friends.
            </span>
          </span>
        </h1>
        {/* Description */}
        <p className="mt-7 max-w-[550px] text-[16px] leading-7 text-white/55 md:text-[17px]">
          The ultimate multiplayer English trivia & bluffing game for friends,
          families & legends.
        </p>
        {/* Feature chips */}
        <div className="mt-7 flex flex-wrap gap-5">
          <FeatureChip
            icon={<Gamepad2 size={17} />}
            text="Play"
            color="text-fuchsia-400"
          />
          <FeatureChip
            icon={<Drama size={17} />}
            text="Bluff"
            color="text-blue-400"
          />
          <FeatureChip
            icon={<Laugh size={17} />}
            text="Laugh"
            color="text-yellow-400"
          />
          <FeatureChip
            icon={<Trophy size={17} />}
            text="Win"
            color="text-amber-400"
          />
        </div>
        <div className="mt-9 flex gap-4 max-[760px]:grid max-[760px]:gap-2.5">
          <Link
            href="/room/7X4K2B"
            className="
    inline-flex h-[49px] w-[220px]
    items-center justify-between
    rounded-full
    bg-[linear-gradient(100deg,#ff5b84,#992cff_48%,#00d8e9)]
    pl-9 pr-4
    font-medium text-white
    shadow-[0_0_28px_rgba(165,49,255,.3),inset_0_0_0_1px_rgba(255,255,255,.48)]
    transition-all duration-300
    hover:-translate-y-0.5
    hover:brightness-110
    max-[760px]:w-full
    max-[760px]:justify-center
    max-[760px]:gap-4
    max-[760px]:pl-0
    max-[760px]:pr-0
  "
          >
            <span>Create Room</span>

            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
              <Plus className="h-5 w-5" />
            </span>
          </Link>

          <Link
            href="/join-room"
            className="
      inline-flex h-[49px] w-[160px]
      items-center justify-between
      rounded-full
      border border-white/15
      bg-[rgba(6,10,29,.9)]
      pl-5 pr-4
      font-medium text-white
      transition-all duration-300
      hover:-translate-y-0.5
      hover:border-white/25
      hover:bg-white/5
      max-[760px]:w-full
      max-[760px]:justify-center
      max-[760px]:gap-5
    "
          >
            <span>Join a Room</span>
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
        </div>
        <div className="mt-[1.15rem] flex items-center gap-[.7rem] text-[.78rem] text-[#c5c7d3] max-[760px]:my-4 max-[760px]:mb-[1.1rem] max-[760px]:justify-center max-[760px]:text-[.7rem]">
          <div className="flex" aria-hidden="true">
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
          <b className="h-[7px] w-[7px] rounded-full bg-[#28e3a3] shadow-[0_0_8px_#28e3a3]" />
          25K+ rooms created today
        </div>
      </div>
      <div className="relative min-h-[430px] lg:min-h-[570px] hidden md:block">
        {/* Main artwork */}
        <div className="hero-art absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-[320px] w-[320px] rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute right-[5%] top-[25%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[90px]" />
          {/* Put your generated character image here */}
          <Image
            src="/images/hero-characters.png"
            alt="Trivia Trap players"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            priority
            className="object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureChip({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <span
        className={`border border-white/10 rounded-full bg-white/[0.025] px-2 py-1 drop-shadow-[0_0_8px_currentColor] ${color}`}
      >
        {icon}
      </span>
      {text}
    </div>
  );
}
