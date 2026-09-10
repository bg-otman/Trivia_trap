'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, Dices } from 'lucide-react';
import { navLinks } from '@/lib/data';
import CTAButton from './CTAButton';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={prefersReduced ? {} : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'py-2' : 'py-4'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className={cn(
              'flex items-center justify-between rounded-2xl border transition-all duration-300',
              scrolled
                ? 'border-white/10 bg-trap-navy-900/80 px-4 py-2.5 backdrop-blur-xl shadow-lg shadow-black/30'
                : 'border-transparent bg-transparent px-4 py-2.5'
            )}
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
                <Dices size={18} className="text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden items-center gap-3 lg:flex">
              <CTAButton
                variant="secondary"
                size="sm"
                label="Join a Room"
                href="/join-room"
                icon="arrow"
              />
              <CTAButton
                variant="primary"
                size="sm"
                label="Create Room"
                href="/room/7X4K2B"
                icon="plus"
              />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={prefersReduced ? {} : { x: '100%' }}
              animate={{ x: 0 }}
              exit={prefersReduced ? {} : { x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-white/10 bg-trap-navy-900/95 p-6"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white">
                  TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={prefersReduced ? {} : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <CTAButton
                  variant="secondary"
                  size="md"
                  label="Join a Room"
                  href="/join-room"
                  icon="arrow"
                  className="w-full"
                />
                <CTAButton
                  variant="primary"
                  size="md"
                  label="Create Room"
                  href="/room/7X4K2B"
                  icon="plus"
                  className="w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
