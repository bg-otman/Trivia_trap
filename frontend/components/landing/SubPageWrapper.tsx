'use client';

import Link from 'next/link';
import { ArrowLeft, Dices } from 'lucide-react';
import AnimatedBackground from '@/components/landing/AnimatedBackground';

interface SubPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function SubPageWrapper({ children, title, showBack = true }: SubPageWrapperProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Mini navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-trap-navy-900/80 px-4 py-2.5 backdrop-blur-xl shadow-lg shadow-black/30">
              <Link href="/" className="group flex items-center gap-2">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Dices size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
                </span>
              </Link>
              {showBack && (
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back home
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="relative pt-28 pb-20">
          {title && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                {title}
              </h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
