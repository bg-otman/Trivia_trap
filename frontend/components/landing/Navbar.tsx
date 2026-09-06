"use client";

import Image from "next/image";
import { Menu, ArrowRight, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "How to Play", href: "#how-to-play" },
  { label: "Features", href: "#features" },
  { label: "Categories", href: "#categories" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-50 mx-auto w-full max-w-[1450px] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <nav
          className="
            flex h-[68px] items-center justify-between
            rounded-2xl
            border border-white/[0.05]
            bg-[#070816]/70
			
            px-4
            backdrop-blur-2xl
            sm:px-6
            lg:h-[74px]
            lg:px-7
          "
        >
          {/* =========================
              LOGO
          ========================== */}
          <a
            href="/"
            className="group relative flex h-full items-center"
            aria-label="Trivia Trap home"
          >
            {/* Logo glow */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                scale-75
                rounded-full
                bg-purple-500/20
                opacity-0
                blur-2xl
                transition-all
                duration-500
                group-hover:scale-100
                group-hover:opacity-100
              "
            />

            <Image
              src="/images/logo.png"
              alt="Trivia Trap"
              width={105}
              height={40}
              priority
              className="
                relative
                h-auto
                w-[105px]
                object-contain
                transition-transform
                duration-300
                group-hover:scale-[1.04]
                sm:w-[120px]
                lg:w-[135px]
              "
            />
          </a>

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}
          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  relative
                  py-2
                  text-[13px]
                  font-medium
                  text-white/60
                  transition-colors
                  duration-200
                  hover:text-white
                "
              >
                {link.label}

                {/* Hover underline */}
                <span
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    h-[1px]
                    w-0
                    -translate-x-1/2
                    bg-gradient-to-r
                    from-purple-400
                    via-pink-400
                    to-cyan-400
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />
              </a>
            ))}
          </div>

          {/* =========================
              DESKTOP ACTIONS
          ========================== */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Login */}
            <button
              className="
                h-[42px]
                rounded-full
                border border-white/[0.12]
                bg-white/[0.02]
                px-5
                text-sm
                font-medium
                text-white/75
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-white/25
                hover:bg-white/[0.06]
                hover:text-white
				
              "
            >
              Log in
            </button>

            {/* Create Room */}
            <button
              className="
                group
                relative
                flex
                h-[42px]
                items-center
                gap-2
                overflow-hidden
                rounded-full
                bg-gradient-to-r
                from-purple-600
                via-fuchsia-500
                to-cyan-400
                px-5
                text-sm
                font-bold
                text-white
                shadow-[0_0_25px_rgba(139,92,246,0.20)]
                transition-all
                duration-300
                hover:scale-[1.03]
                hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]
              "
            >
              {/* Animated shine */}
              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <span className="relative">Create Room</span>

              <ArrowRight
                size={16}
                className="
                  relative
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>

          {/* =========================
              MOBILE MENU BUTTON
          ========================== */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border border-white/[0.10]
              bg-white/[0.03]
              text-white/80
              transition
              hover:bg-white/[0.07]
              lg:hidden
            "
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* =========================
            MOBILE MENU
        ========================== */}
        {mobileMenuOpen && (
          <div
            className="
              mt-2
              overflow-hidden
              rounded-2xl
              border border-white/[0.08]
              bg-[#070816]/95
              p-4
              shadow-2xl
              backdrop-blur-2xl
              lg:hidden
            "
          >
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/65
                    transition
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  {link.label}
                </a>
              ))}

              <div className="my-2 h-px bg-white/[0.06]" />

              <button
                className="
                  flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  via-fuchsia-500
                  to-cyan-400
                  text-sm
                  font-bold
                  shadow-[0_0_30px_rgba(139,92,246,0.20)]
                "
              >
                Create Room
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
