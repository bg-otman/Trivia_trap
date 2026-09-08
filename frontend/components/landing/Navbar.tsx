"use client";

import { Menu, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const begin = (message: string) => {
    console.log(message);
  };

  return (
    <>
      {/* Ambient background */}
      <div className="pointer-events-none absolute top-80 right-[-12rem] h-96 w-96 rounded-full bg-[#9b25ff] opacity-[0.12] blur-[110px]" />

      <div className="pointer-events-none absolute top-[42rem] left-[-15rem] h-96 w-96 rounded-full bg-[#00d9ff] opacity-[0.12] blur-[110px]" />

      {/* Navbar */}
      <header className="relative z-50 mx-auto flex h-[106px] max-w-[1460px] items-center justify-between px-6 md:grid md:grid-cols-[170px_1fr_auto] md:gap-8">

        {/* Logo */}
        <Link
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
        </Link>

        {/* Desktop navigation */}
        <nav
          className="
            hidden
            items-center
            justify-center
            gap-[clamp(1.4rem,3vw,3.6rem)]
            text-[0.92rem]
            md:flex

            [&_a]:text-[#f0eff5]
            [&_a]:transition-[color,transform]
            [&_a]:duration-200
            [&_a:hover]:-translate-y-0.5
            [&_a:hover]:text-[#4bdbea]
          "
          aria-label="Main navigation"
        >
          <Link href="/#how">How to Play</Link>

          <Link href="/#features">Features</Link>

          <Link href="/categories">Categories</Link>

          <Link href="/leaderboard">Leaderboard</Link>

          <Link href="#faq">FAQ</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden gap-4 md:flex">

          {/* Login */}
          <button
            type="button"
            className="
              cursor-pointer
              rounded-full
              border
              border-white/22
              bg-transparent
              px-[1.7rem]
              py-[0.82rem]
              text-white
              transition-colors
              hover:bg-white/5
            "
            onClick={() =>
              begin("Login opens in the next project step.")
            }
          >
            Log in
          </button>

          {/* Create Room */}
          <Link
            href="/room/7X4K2B"
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-full
              border-0
              bg-[linear-gradient(100deg,#7c2af0,#a02ff0_45%,#00d6e9)]
              px-[1.45rem]
              py-[0.85rem]
              font-bold
              text-white
              shadow-[inset_0_0_0_1px_rgba(255,255,255,0.34),0_0_25px_rgba(87,69,255,0.18)]
              transition-transform
              hover:scale-[1.03]
            "
          >
            Create Room
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="
            block
            cursor-pointer
            rounded-lg
            p-2
            text-white
            md:hidden
          "
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          className="
            absolute
            left-0
            right-0
            top-[106px]
            z-40
            flex
            flex-col
            gap-5
            border-t
            border-white/10
            bg-[#0d0b18]/95
            p-6
            shadow-2xl
            backdrop-blur-xl
            md:hidden
          "
          aria-label="Mobile navigation"
        >
          <Link
            href="#how"
            className="text-white transition-colors hover:text-[#4bdbea]"
            onClick={() => setMenuOpen(false)}
          >
            How to Play
          </Link>

          <Link
            href="#features"
            className="text-white transition-colors hover:text-[#4bdbea]"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </Link>

          <Link
            href="/categories"
            className="text-white transition-colors hover:text-[#4bdbea]"
            onClick={() => setMenuOpen(false)}
          >
            Categories
          </Link>

          <Link
            href="/leaderboard"
            className="text-white transition-colors hover:text-[#4bdbea]"
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </Link>

          <Link
            href="#faq"
            className="text-white transition-colors hover:text-[#4bdbea]"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>

          {/* Mobile actions */}
          <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-5">

            {/* Login */}
            <button
              type="button"
              className="
                rounded-full
                border
                border-white/20
                px-6
                py-3
                text-white
              "
              onClick={() => {
                begin("Login opens in the next project step.");
                setMenuOpen(false);
              }}
            >
              Log in
            </button>

            {/* Create Room */}
            <button
              type="button"
              className="
                flex
                items-center
                justify-center
                gap-3
                rounded-full
                bg-[linear-gradient(100deg,#7c2af0,#a02ff0_45%,#00d6e9)]
                px-6
                py-3
                font-bold
                text-white
              "
              onClick={() => {
                begin("Your room is ready to be created!");
                setMenuOpen(false);
              }}
            >
              Create Room
              <ArrowRight size={17} />
            </button>

          </div>
        </nav>
      )}
    </>
  );
}