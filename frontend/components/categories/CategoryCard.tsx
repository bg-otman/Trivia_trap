"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Category = {
  name: string;
  icon: string;
  tone: string;
  glow: string;
  description: string;
  difficulty: string;
};

const toneStyles: Record<string, string> = {
  blue: "from-blue-500/[0.16] to-blue-950/[0.03] border-blue-400/20",
  amber: "from-amber-500/[0.16] to-orange-950/[0.03] border-amber-400/20",
  cyan: "from-cyan-500/[0.16] to-blue-950/[0.03] border-cyan-400/20",
  purple: "from-purple-500/[0.16] to-purple-950/[0.03] border-purple-400/20",
  emerald: "from-emerald-500/[0.16] to-teal-950/[0.03] border-emerald-400/20",
  orange: "from-orange-500/[0.16] to-amber-950/[0.03] border-orange-400/20",
  indigo: "from-indigo-500/[0.16] to-blue-950/[0.03] border-indigo-400/20",
  pink: "from-pink-500/[0.16] to-purple-950/[0.03] border-pink-400/20",
  yellow: "from-yellow-500/[0.16] to-orange-950/[0.03] border-yellow-400/20",
  green: "from-green-500/[0.16] to-emerald-950/[0.03] border-green-400/20",
  violet: "from-violet-500/[0.16] to-purple-950/[0.03] border-violet-400/20",
  fuchsia: "from-fuchsia-500/[0.16] to-purple-950/[0.03] border-fuchsia-400/20",
};

export default function CategoryCard({
  category,
}: {
  category: Category;
}) {


  return (
    <div   
      className={`
        group
        relative
        min-h-[285px]
        overflow-hidden
        rounded-[22px]
        border
        bg-gradient-to-br
        ${toneStyles[category.tone] ?? toneStyles.purple}
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/20
        hover:shadow-[0_20px_50px_rgba(0,0,0,.35)]
      `}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.025)`,
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-[60px] transition-all duration-500 group-hover:scale-125"
        style={{
          background: category.glow,
        }}
      />

      {/* Bottom glow */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-[70px] transition-opacity duration-500 group-hover:opacity-40"
        style={{
          background: category.glow,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-[17px] font-semibold text-white">
            {category.name}
          </h3>

          <span className="mt-1 block text-[10px] text-white/35">
            {category.difficulty}
          </span>
        </div>
      </div>

      {/* Emoji */}
      <div className="relative z-10 flex h-[145px] items-center justify-center">
        <div
          className="
            relative
            flex
            h-[125px]
            w-[125px]
            items-center
            justify-center
            rounded-full
            transition-all
            duration-500
            group-hover:scale-110
            group-hover:-translate-y-1
          "
          style={{
            background: `radial-gradient(circle, ${category.glow} 0%, transparent 70%)`,
          }}
        >
          <span
            className="
              relative
              text-[76px]
              leading-none
              drop-shadow-[0_12px_15px_rgba(0,0,0,.5)]
              transition-transform
              duration-500
              group-hover:scale-105
            "
          >
            {category.icon}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 line-clamp-2 text-[11px] leading-5 text-white/40">
        {category.description}
      </p>
    </div>
  );
}