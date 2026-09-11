'use client';

import { motion, useReducedMotion } from 'framer-motion';
import CTAButton from './CTAButton';

export default function FinalCTA() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-trap-navy-800/60 to-trap-navy-950/80 px-6 py-16 text-center backdrop-blur-sm sm:px-12 sm:py-20"
          style={{ boxShadow: '0 20px 100px rgba(0,0,0,0.5)' }}
        >
          {/* Ambient glows */}
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-trap-purple/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-trap-cyan/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-trap-pink/10 blur-3xl" />

          {/* Content */}
          <div className="relative">
            <motion.h2
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              Ready to set the trap?
            </motion.h2>

            <motion.p
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-5 max-w-md text-base text-white/50 sm:text-lg"
            >
              Create a room, invite your friends, and see who actually knows their stuff.
            </motion.p>

            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
