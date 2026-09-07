"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import {
  ArrowLeft,
  Search,
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
} from "lucide-react";

import CategoryCard, {
  type Category,
} from "./CategoryCard";

const categories: Category[] = [
  {
    name: "Geography",
    icon: "🌍",
    tone: "blue",
    glow: "rgba(45, 156, 255, 0.35)",
    difficulty: "Easy",
    description:
      "Countries, capitals, landmarks, maps & the world.",
  },

  {
    name: "History",
    icon: "🏛️",
    tone: "amber",
    glow: "rgba(255, 157, 33, 0.35)",
    difficulty: "Medium",
    description:
      "Ancient civilizations, wars, kings, empires & events.",
  },

  {
    name: "Science",
    icon: "🧪",
    tone: "cyan",
    glow: "rgba(32, 180, 255, 0.35)",
    difficulty: "Medium",
    description:
      "Space, biology, chemistry, physics & discoveries.",
  },

  {
    name: "Movies & TV",
    icon: "🎬",
    tone: "purple",
    glow: "rgba(168, 85, 247, 0.35)",
    difficulty: "Easy",
    description:
      "Movies, series, characters, actors & iconic moments.",
  },

  {
    name: "Sports",
    icon: "⚽",
    tone: "emerald",
    glow: "rgba(16, 185, 129, 0.35)",
    difficulty: "Medium",
    description:
      "Football, basketball, tennis, Olympics & more.",
  },

  {
    name: "Art & Culture",
    icon: "🎨",
    tone: "orange",
    glow: "rgba(255, 145, 55, 0.35)",
    difficulty: "Hard",
    description:
      "Art, music, literature, traditions & culture.",
  },

  {
    name: "Technology",
    icon: "💻",
    tone: "indigo",
    glow: "rgba(99, 102, 241, 0.35)",
    difficulty: "Medium",
    description:
      "Computers, AI, programming, inventions & gadgets.",
  },

  {
    name: "Music",
    icon: "🎵",
    tone: "pink",
    glow: "rgba(236, 72, 153, 0.35)",
    difficulty: "Easy",
    description:
      "Artists, songs, albums, instruments & music history.",
  },

  {
    name: "Food & Drink",
    icon: "🍔",
    tone: "yellow",
    glow: "rgba(250, 204, 21, 0.35)",
    difficulty: "Easy",
    description:
      "Cuisine, ingredients, dishes, chefs & traditions.",
  },

  {
    name: "Animals",
    icon: "🦁",
    tone: "green",
    glow: "rgba(34, 197, 94, 0.35)",
    difficulty: "Easy",
    description:
      "Wildlife, pets, nature, species & animal facts.",
  },

  {
    name: "Space",
    icon: "🚀",
    tone: "violet",
    glow: "rgba(139, 92, 246, 0.35)",
    difficulty: "Hard",
    description:
      "Planets, galaxies, stars, astronauts & the universe.",
  },

  {
    name: "Gaming",
    icon: "🎮",
    tone: "fuchsia",
    glow: "rgba(217, 70, 239, 0.35)",
    difficulty: "Medium",
    description:
      "Games, characters, consoles, esports & gaming history.",
  },
];

const filters = [
  "All",
  "Popular",
  "Easy",
  "Medium",
  "Hard",
];

export default function CategoriesPage() {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[radial-gradient(circle_at_70%_5%,rgba(91,48,220,.18),transparent_28rem),radial-gradient(circle_at_5%_40%,rgba(0,178,255,.07),transparent_24rem),linear-gradient(135deg,#05091b_0%,#020414_48%,#070419_100%)]
        px-[clamp(1.1rem,4.3vw,4.7rem)]
        pb-16
        text-white
      "
    >
      {/* Grid */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          opacity-[.20]
          [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)]
          [background-size:46px_46px]
        "
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-purple-600/[0.07] blur-[140px]" />

      {/* =========================
          HEADER
      ========================== */}

      <Navbar />

      {/* =========================
          HERO
      ========================== */}

      <section className="relative z-10 mx-auto max-w-[1100px] pb-10 pt-16 text-center md:pt-20">

        <div
          className="
            mx-auto
            mb-5
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-purple-400/20
            bg-purple-500/[0.07]
            px-4
            py-2
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-purple-300
          "
        >
          <Sparkles size={14} />
          Explore the Trivia Universe
        </div>

        <h1
          className="
            font-poppins
            text-[44px]
            font-[800]
            leading-[1]
            tracking-[-2px]
            sm:text-[58px]
            md:text-[72px]
          "
        >
          Choose your{" "}
          <span className="bg-gradient-to-r from-[#FF5C7A] via-[#A855F7] to-[#20D9F5] bg-clip-text text-transparent">
            battlefield.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[650px] text-[15px] leading-7 text-white/45 md:text-[16px]">
          Pick a category, invite your friends, and prove who really
          knows their stuff. Or bluff your way to the top.
        </p>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

          <Stat
            icon={<Gamepad2 size={15} />}
            value="12"
            label="Categories"
          />

          <Stat
            icon={<Trophy size={15} />}
            value="9.2K+"
            label="Questions"
          />

          <Stat
            icon={<Flame size={15} />}
            value="25K+"
            label="Players today"
          />

        </div>
      </section>

      {/* =========================
          TOOLBAR
      ========================== */}

      <section className="relative z-10 mx-auto max-w-[1390px]">

        <div
          className="
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.018]
            p-3
            backdrop-blur-xl
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          {/* Filters */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {filters.map((filter, index) => (
              <button
                key={filter}
                className={`
                  whitespace-nowrap
                  rounded-xl
                  px-4
                  py-2
                  text-xs
                  font-medium
                  transition
                  ${
                    index === 0
                      ? "bg-white/[0.09] text-white"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-[240px]">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="text"
              placeholder="Search categories..."
              className="
                h-9
                w-full
                rounded-xl
                border
                border-white/[0.08]
                bg-black/20
                pl-9
                pr-3
                text-xs
                text-white
                outline-none
                placeholder:text-white/25
                focus:border-purple-400/40
              "
            />

          </div>
        </div>
      </section>

      {/* =========================
          CATEGORY GRID
      ========================== */}

      <section className="relative z-10 mx-auto mt-6 max-w-[1390px]">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
            />
          ))}

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="relative z-10 mx-auto mt-14 flex max-w-[1390px] justify-between border-t border-white/[0.06] pt-6 text-[11px] text-white/30">
        <span>© 2026 Trivia Trap</span>
        <span>Play fair. Bluff brilliantly.</span>
      </footer>
    </main>
  );
}

/* =========================
   STAT
========================= */

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2 backdrop-blur-xl">

      <span className="text-purple-400">
        {icon}
      </span>

      <span className="text-xs font-semibold text-white/80">
        {value}
      </span>

      <span className="text-[10px] text-white/35">
        {label}
      </span>

    </div>
  );
}