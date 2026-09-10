'use client';

import Link from 'next/link';
import { Dices } from 'lucide-react';

const footerLinks = [
  { label: 'How to Play', href: '#how' },
  { label: 'Categories', href: '/categories' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30">
                <Dices size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
              </span>
            </Link>
            <p className="text-sm text-white/40">Play fair. Bluff brilliantly.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-sm text-white/30">© 2026 Trivia Trap</p>
        </div>
      </div>
    </footer>
  );
}
