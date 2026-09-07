"use client";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
const categories = [
  {
    name: "Geography",
    icon: "🌍",
    tone: "blue",
    glow: "rgba(0, 126, 255, 0.35)",
  },
  {
    name: "History",
    icon: "🏛️",
    tone: "amber",
    glow: "rgba(255, 157, 33, 0.35)",
  },
  {
    name: "Science",
    icon: "⚗️",
    tone: "indigo",
    glow: "rgba(37, 105, 255, 0.35)",
  },
  {
    name: "Movies & TV",
    icon: "🎬",
    tone: "purple",
    glow: "rgba(137, 55, 255, 0.4)",
  },
  {
    name: "Sports",
    icon: "⚽",
    tone: "teal",
    glow: "rgba(0, 205, 188, 0.35)",
  },
  {
    name: "Art & Culture",
    icon: "🎨",
    tone: "gold",
    glow: "rgba(255, 164, 36, 0.35)",
  },
];

export default function CategorySection() {
  return (
    <section className="relative z-[4] mx-auto mb-4 max-w-[1390px] rounded-[22px] border border-[rgba(142,158,213,.18)] bg-[linear-gradient(145deg,rgba(9,17,43,.76),rgba(3,9,27,.82))] p-[.9rem_1.35rem_1rem] shadow-[inset_0_1px_0_rgba(255,255,255,.025)] backdrop-blur-[18px] max-[760px]:rounded-[18px] max-[760px]:p-[.85rem]" id="categories">
      <div className="mb-[.65rem] flex items-center justify-between">
        <h2 className="m-0 flex items-center gap-2 text-base max-[760px]:text-[.99rem]">
          Explore Categories <Sparkles className="w-4 text-[#ffd133]" />
        </h2>
        <Link
          href="/categories"
          className="
            hidden
            items-center
            gap-1
            text-sm
            text-white/50
            transition
            hover:text-white
            sm:flex
          "
        >
          View all categories
          <span>→</span>
        </Link>
      </div>
      <div className="grid grid-cols-6 gap-[.85rem] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-[repeat(4,minmax(95px,1fr))] max-[760px]:overflow-x-auto max-[760px]:pb-[.35rem] max-[760px]:[scrollbar-width:none]">
        {categories.map((category) => (
          <article
            key={category.name}
              className={`group relative flex min-h-[147px] flex-col items-center justify-between overflow-hidden rounded-2xl border p-[.85rem] transition-all duration-500 ease-out hover:-translate-y-1 max-[760px]:min-h-[120px] ${
              category.tone === "blue"
                ? "border-blue-400/30 bg-[#071b3d]"
                : category.tone === "amber"
                ? "border-amber-400/30 bg-[#22170b]"
                : category.tone === "indigo"
                ? "border-indigo-400/30 bg-[#071533]"
                : category.tone === "purple"
                ? "border-purple-400/30 bg-[#150d2b]"
                : category.tone === "teal"
                ? "border-teal-400/30 bg-[#062625]"
                : "border-yellow-400/30 bg-[#23190c]"
            }`}
          >
            {/* Animated background glow */}
          <div
            className="
              pointer-events-none absolute inset-[-40%]
              rounded-full
              opacity-0 blur-3xl
              transition-all duration-700 ease-out
              group-hover:scale-125
              group-hover:opacity-100
            "
            style={{
              background: `radial-gradient(
                circle,
                ${category.glow} 0%,
                transparent 60%
              )`,
            }}
          />

            {/* Content */}
            <h3 className="relative z-10 m-0 self-start text-[.93rem] max-[760px]:text-[.7rem]">
              {category.name}
            </h3>

            <div
              className="
                relative z-10
                text-[3.4rem]
                drop-shadow-[0_9px_10px_rgba(0,0,0,.5)]
                transition-all duration-300 ease-out
                group-hover:-translate-y-1
                group-hover:scale-[1.08]
                group-hover:rotate-2
                max-[760px]:text-[2.65rem]
              "
              aria-hidden="true"
            >
              {category.icon}
            </div>

          </article>
          ))}
      </div>
    </section>
  );
}
