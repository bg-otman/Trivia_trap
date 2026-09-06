"use client";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
const categories = [
  {
    name: "Geography",
    count: "1,280",
    image: "/categories/geography.png",
    gradient: "from-[#0D2945]/80 via-[#102C4B]/50 to-[#071525]",
    border: "border-[#1B6DA5]/40",
  },
  {
    name: "History",
    count: "950",
    image: "/categories/history.png",
    gradient: "from-[#4A3218]/80 via-[#3B2816]/50 to-[#17100A]",
    border: "border-[#B77B2B]/45",
  },
  {
    name: "Science",
    count: "1,100",
    image: "/categories/science.png",
    gradient: "from-[#102D61]/80 via-[#122B5A]/50 to-[#07152D]",
    border: "border-[#3476D9]/45",
  },
  {
    name: "Movies & TV",
    count: "870",
    image: "/categories/movies.png",
    gradient: "from-[#33205D]/80 via-[#251647]/50 to-[#100A20]",
    border: "border-[#7C4FD1]/45",
  },
  {
    name: "Sports",
    count: "760",
    image: "/categories/sports.png",
    gradient: "from-[#0C4745]/80 via-[#103936]/50 to-[#061D1C]",
    border: "border-[#159A91]/40",
  },
  {
    name: "Art & Culture",
    count: "640",
    image: "/categories/art.png",
    gradient: "from-[#4B3515]/80 via-[#392710]/50 to-[#1A1207]",
    border: "border-[#A97726]/40",
  },
];
export default function CategorySection() {
  return (
    <section
      id="categories"
      className="mx-auto w-full max-w-[1450px] px-5 pb-16 md:px-8"
    >
      <div className=" relative rounded-[24px] border border-white/[0.07] bg-[#080B18]/70 px-5 py-4 backdrop-blur-xl md:px-7 md:py-5 ">
        {/* ========================= HEADER ========================== */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-white md:text-[16px]">
            Explore Categories
            <span className="ml-2 text-[13px] text-yellow-400"> ✦ </span>
          </h2>
          <button className=" hidden text-[10px] text-white/50 transition-colors hover:text-white sm:block ">
            View all categories <span className="ml-1">→</span>
          </button>
        </div>
        {/* ========================= CATEGORY CAROUSEL ========================== */}
        <div className="relative">
          {/* LEFT ARROW */}
          <button
            aria-label="Previous categories"
            className=" absolute -left-[25px] top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0A0D1D]/95 text-white/70 shadow-xl backdrop-blur-xl transition hover:border-purple-400/40 hover:bg-[#11152A] hover:text-white md:flex "
          >
            <ArrowLeft size={15} />
          </button>
          {/* CARDS */}
          <div className=" flex gap-3 overflow-x-auto pb-1 scrollbar-none ">
            {categories.map((category) => (
              <button
                key={category.name}
                className={` group relative h-[122px] min-w-[135px] overflow-hidden rounded-[14px] border ${category.border} bg-gradient-to-br ${category.gradient} px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] `}
              >
                {/* Subtle card glow */}
                <div className=" pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/[0.04] blur-2xl " />
                {/* CATEGORY NAME */}
                <div className="relative z-10">
                  <span className="whitespace-nowrap text-[12px] font-medium text-white/95">
                    {category.name}
                  </span>
                </div>
                {/* 3D ICON */}
                <div className="relative flex h-[75px] items-center justify-center">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={76}
                    height={76}
                    className=" h-[70px] w-[70px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 "
                  />
                </div>
                {/* QUESTION COUNT */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-[9px] font-medium text-white/80">
                    {category.count} Questions
                  </span>
                </div>
              </button>
            ))}
          </div>
          {/* RIGHT ARROW */}
          <button
            aria-label="Next categories"
            className=" absolute -right-[25px] top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0A0D1D]/95 text-white/70 shadow-xl backdrop-blur-xl transition hover:border-purple-400/40 hover:bg-[#11152A] hover:text-white md:flex "
          >
            <ArrowRight size={15} />
          </button>
        </div>
        {/* MOBILE VIEW ALL */}
        <button className=" mt-3 w-full text-center text-[11px] text-white/45 sm:hidden ">
          View all categories →
        </button>
      </div>
    </section>
  );
}
