"use client";
import Image from "next/image";
import Link from "next/link";
import CTAButton from './CTAButton';
import { motion, useReducedMotion } from "framer-motion";
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
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      className="relative z-[2] mx-auto grid min-h-[530px] max-w-[1460px] grid-cols-[39%_61%] items-center pt-28 max-[1050px]:grid-cols-[46%_54%] max-[1050px]:pt-24 max-[760px]:block max-[760px]:min-h-0 max-[760px]:pt-20 max-[760px]:pb-20 max-[760px]:px-5"
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-[5] py-[1.1rem] pb-[1.4rem] max-[760px]:pt-2"
      >
        <motion.div
          variants={itemVariants}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-white/75 backdrop-blur-xl"
        >
          <Zap size={14} className="fill-yellow-400 text-yellow-400" />A trivia
          party.
          <span className="text-purple-300">A little bluff.</span> Endless fun.
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className=" font-poppins text-[48px] font-[800] leading-[0.98] tracking-[-2.5px] sm:text-[60px] md:text-[72px] lg:text-[76px] "
        >
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
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mt-7 max-w-[550px] text-[16px] leading-7 text-white/55 md:text-[17px]"
        >
          The ultimate multiplayer English trivia & bluffing game for friends,
          families & legends.
        </motion.p>

        {/* Feature chips */}
        <motion.div variants={itemVariants} className="mt-7 flex flex-wrap gap-5">
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
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-9 flex gap-4 max-[760px]:grid max-[760px]:gap-2.5"
        >
          <CTAButton
            variant="primary"
            size="lg"
            label="Create Room"
            href="/room/7X4K2B"
            icon="plus"
            className="w-full sm:w-auto"
          />
          <CTAButton
            variant="secondary"
            size="lg"
            label="Join a Room"
            href="/join-room"
            icon="arrow"
            className="w-full sm:w-auto"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-[1.15rem] flex items-center gap-[.7rem] text-[.78rem] text-[#c5c7d3] max-[760px]:my-4 max-[760px]:mb-[1.1rem] max-[760px]:justify-center max-[760px]:text-[.7rem]"
        >
          <div className="flex" aria-hidden="true">
            {["🧑🏽", "👩🏻", "👨🏾", "👩🏽‍🦱", "🧑🏻‍🦰"].map((emoji, i) => (
              <motion.span
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 200 }}
                className="ml-[-5px] grid h-[27px] w-[27px] place-items-center overflow-hidden rounded-full border border-[#93a1d6] bg-[#182142] text-base first:ml-0"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
          <b className="h-[7px] w-[7px] rounded-full bg-[#28e3a3] shadow-[0_0_8px_#28e3a3]" />
          25K+ rooms created today
        </motion.div>
      </motion.div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        className="relative min-h-[430px] lg:min-h-[570px] hidden md:block"
      >
        {/* Main artwork */}
        <motion.div
          animate={prefersReduced ? {} : { y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hero-art absolute inset-0"
        >
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
        </motion.div>
      </motion.div>
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
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-2 text-sm text-white/70"
    >
      <span
        className={`border border-white/10 rounded-full bg-white/[0.025] px-2 py-1 drop-shadow-[0_0_8px_currentColor] ${color}`}
      >
        {icon}
      </span>
      {text}
    </motion.div>
  );
}