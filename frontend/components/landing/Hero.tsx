"use client";
import Image from "next/image";
import { ArrowRight, Gamepad2, Laugh, Trophy, Drama, Zap } from "lucide-react";
export default function Hero() {
  return (
    <section className="relative mx-auto max-w-[1450px] px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
      {" "}
      {/* Background glow */}{" "}
      <div className="pointer-events-none absolute left-[30%] top-[10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />{" "}
      <div className="pointer-events-none absolute right-0 top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />{" "}
      {/* Particles */}{" "}
      <div className="particles pointer-events-none absolute inset-0 opacity-60">
        {" "}
        <span className="particle left-[20%] top-[15%]" />{" "}
        <span className="particle left-[42%] top-[25%]" />{" "}
        <span className="particle left-[72%] top-[18%]" />{" "}
        <span className="particle left-[83%] top-[45%]" />{" "}
        <span className="particle left-[58%] top-[55%]" />{" "}
      </div>{" "}
      <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {" "}
        {/* LEFT */}{" "}
        <div className="relative z-10 max-w-[650px]">
          {" "}
          {/* Eyebrow */}{" "}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-white/75 backdrop-blur-xl">
            {" "}
            <Zap size={14} className="fill-yellow-400 text-yellow-400" />A
            trivia party.{" "}
            <span className="text-purple-300">A little bluff.</span> Endless
            fun.{" "}
          </div>{" "}
          {/* Heading */}{" "}
          <h1 className=" font-poppins text-[48px] font-[800] leading-[0.98] tracking-[-2.5px] sm:text-[60px] md:text-[72px] lg:text-[76px] ">
            {" "}
            <span className="block text-[#F5F5F7]"> Think fast. </span>{" "}
            <span className="block text-[#F5F5F7]"> Bluff smart. </span>{" "}
            <span className="block">
              {" "}
              <span className="bg-gradient-to-r from-[#FF5C7A] via-[#F05BAA] to-[#C05AEF] bg-clip-text text-transparent">
                {" "}
                Trap{" "}
              </span>{" "}
              <span className="bg-gradient-to-r from-[#A855F7] via-[#8C70F7] to-[#627FF4] bg-clip-text text-transparent">
                {" "}
                your{" "}
              </span>{" "}
              <span className="bg-gradient-to-r from-[#398CEB] via-[#20B9F3] to-[#20D9F5] bg-clip-text text-transparent">
                {" "}
                friends.{" "}
              </span>{" "}
            </span>{" "}
          </h1>{" "}
          {/* Description */}{" "}
          <p className="mt-7 max-w-[550px] text-[16px] leading-7 text-white/55 md:text-[17px]">
            {" "}
            The ultimate multiplayer English trivia & bluffing game for friends,
            families & legends.{" "}
          </p>{" "}
          {/* Feature chips */}{" "}
          <div className="mt-7 flex flex-wrap gap-5">
            {" "}
            <FeatureChip
              icon={<Gamepad2 size={17} />}
              text="Play"
              color="text-fuchsia-400"
            />{" "}
            <FeatureChip
              icon={<Drama size={17} />}
              text="Bluff"
              color="text-blue-400"
            />{" "}
            <FeatureChip
              icon={<Laugh size={17} />}
              text="Laugh"
              color="text-yellow-400"
            />{" "}
            <FeatureChip
              icon={<Trophy size={17} />}
              text="Win"
              color="text-amber-400"
            />{" "}
          </div>{" "}
          {/* CTA */}{" "}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {" "}
            {/* Create Room */}{" "}
            <button className=" group relative flex h-[48px] min-w-[232px] items-center justify-center gap-4 overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-[#FF4F81] via-[#7547F5] to-[#20CFEF] px-5 text-[16px] font-semibold text-white shadow-[0_4px_24px_rgba(103,75,245,0.30)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_5px_32px_rgba(103,75,245,0.42)] ">
              {" "}
              {/* Button content */}{" "}
              <span className="relative z-10 whitespace-nowrap">
                {" "}
                Create Room{" "}
              </span>{" "}
              {/* Plus circle */}{" "}
              <span className=" relative z-10 flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[23px] font-light leading-none text-white backdrop-blur-sm ">
                {" "}
                +{" "}
              </span>{" "}
              {/* Subtle shine */}{" "}
              <span className=" pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full " />{" "}
            </button>{" "}
            {/* Join Room */}{" "}
            <button className=" group flex h-[48px] min-w-[165px] items-center justify-center gap-5 rounded-full border border-white/[0.14] bg-[#080B1B]/75 px-6 text-[15px] font-medium text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(139,92,246,0.12)] ">
              {" "}
              <span>Join a Room</span>{" "}
              <ArrowRight
                size={17}
                strokeWidth={1.8}
                className=" text-white/80 transition-transform duration-300 group-hover:translate-x-1 "
              />{" "}
            </button>{" "}
          </div>{" "}
          {/* Social proof */}{" "}
          <div className="mt-7 flex items-center gap-3">
            {" "}
            <div className="flex -space-x-2">
              {" "}
              {[
                "/avatars/a1.png",
                "/avatars/a1.png",
                "/avatars/a1.png",
                "/avatars/a1.png",
                "/avatars/a1.png",
              ].map((src, index) => (
                <div
                  key={index}
                  className=" relative h-8 w-8 overflow-hidden rounded-full border-2 border-[#050617] bg-[#101126] "
                >
                  {" "}
                  <Image
                    src={src}
                    alt={`Player avatar ${index + 1}`}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />{" "}
                </div>
              ))}{" "}
            </div>{" "}
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{" "}
            <span className="text-xs text-white/55">
              {" "}
              25K+ rooms created today{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* RIGHT ARTWORK */}{" "}
        <div className="relative min-h-[430px] lg:min-h-[570px]">
          {" "}
          {/* Main artwork */}{" "}
          <div className="hero-art absolute inset-0">
            {" "}
            <div className="absolute left-[10%] top-[15%] h-[320px] w-[320px] rounded-full bg-purple-600/20 blur-[100px]" />{" "}
            <div className="absolute right-[5%] top-[25%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[90px]" />{" "}
            {/* Put your generated character image here */}{" "}
            <Image
              src="/images/hero-characters.png"
              alt="Trivia Trap players"
              fill
              priority
              className="object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.5)]"
            />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
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
      {" "}
      <span
        className={`border border-white/10 rounded-full bg-white/[0.025] px-2 py-1 drop-shadow-[0_0_8px_currentColor] ${color}`}
      >
        {" "}
        {icon}{" "}
      </span>{" "}
      {text}{" "}
    </div>
  );
}
function SpeechBubble({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-20 hidden max-w-[160px] rounded-2xl border border-white/10 bg-[#101126]/80 px-4 py-3 text-center text-xs font-medium text-white/85 shadow-2xl backdrop-blur-xl md:block ${className}`}
    >
      {" "}
      {text}{" "}
    </div>
  );
}
