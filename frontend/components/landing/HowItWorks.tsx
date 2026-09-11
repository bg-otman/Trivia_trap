'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Grid, MessageCircle, Eye } from 'lucide-react';
import { howToPlaySteps } from '@/lib/data';

const iconMap = {
  Plus: Plus,
  Grid: Grid,
  MessageCircle: MessageCircle,
  Eye: Eye,
};

export default function HowItWorks() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="how" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-trap-purple-light">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            How Trivia Trap Works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {howToPlaySteps.map((step, i) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={prefersReduced ? {} : { y: -6 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 transition-colors duration-300 hover:border-white/20">
                  {/* Glow on hover */}
                  <div className="absolute -top-20 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-trap-purple/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Step number */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white/10 transition-colors group-hover:text-white/20">
                      {step.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-trap-cyan transition-all duration-300 group-hover:scale-110 group-hover:border-trap-cyan/30 group-hover:bg-trap-cyan/10">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{step.desc}</p>

                  {/* Mini illustration */}
                  <div className="mt-4 flex items-center gap-1.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          j <= i ? 'bg-gradient-to-r from-trap-pink to-trap-cyan' : 'bg-white/10'
                        }`}
                        style={{ width: j <= i ? '24px' : '12px' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Connecting arrow (desktop) */}
                {i < howToPlaySteps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block">
                    <div className="text-white/20">→</div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
