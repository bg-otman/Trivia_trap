'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Drama, Brain, Users, Zap, Trophy, Target } from 'lucide-react';
import { features } from '@/lib/data';

const iconMap = {
  Drama: Drama,
  Brain: Brain,
  Users: Users,
  Zap: Zap,
  Trophy: Trophy,
  Target: Target,
};

// Asymmetric layout: different column spans per card
const layoutClasses = [
  'lg:col-span-2',       // Bluff mechanics — wide
  'lg:col-span-1',       // Fast thinking
  'lg:col-span-1',       // Multiplayer
  'lg:col-span-1',       // Real-time
  'lg:col-span-1',       // Competitive
  'lg:col-span-2',       // Strategic voting — wide
];

const accentColors = [
  { glow: 'rgba(255,79,129,0.12)', border: 'hover:border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/10' },
  { glow: 'rgba(168,85,247,0.12)', border: 'hover:border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { glow: 'rgba(25,217,237,0.12)', border: 'hover:border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { glow: 'rgba(255,209,102,0.12)', border: 'hover:border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { glow: 'rgba(52,211,153,0.12)', border: 'hover:border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { glow: 'rgba(59,130,246,0.12)', border: 'hover:border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function FeatureSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="features" className="relative py-20 sm:py-28">
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
            Why Trivia Trap?
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Not your average quiz.
          </h2>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            const accent = accentColors[i];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                whileHover={prefersReduced ? {} : { y: -5 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 backdrop-blur-sm transition-colors duration-300 ${accent.border} ${layoutClasses[i]}`}
              >
                {/* Glow */}
                <div
                  className="absolute -top-20 right-0 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: accent.glow }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 ${accent.bg} ${accent.text} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
